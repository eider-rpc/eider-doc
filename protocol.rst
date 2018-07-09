.. protocol

.. _protocol:

Protocol
========

The Eider protocol starts with the `JSON-RPC 1.0 specification
<http://json-rpc.org/wiki/specification>`_ and extends it to manage sessions,
bridged connections, object and method marshalling, call cancellation, and
alternative serialization formats.


.. _message:

Messages
--------

Request
^^^^^^^

A request (method invocation) takes the following form:

.. sourcecode:: json

    {
        "dst": 1,
        "src": 2,
        "id": 3,
        "this": {
            "__*__": 4,
            "rsid": 5
        },
        "method": "answer",
        "params": [
            "life",
            "the universe",
            "everything"
        ]
    }

.. describe:: dst

    For calls that should be forwarded (bridged) to another peer, this is an
    integer identifying the destination connection.  For direct calls, it
    should be ``null`` or not present.

.. describe:: src

    For calls that have been forwarded (bridged) from another peer, this is an
    integer identifying the source connection.  For direct calls, it should be
    ``null`` or not present.

.. describe:: id

    This is an integer uniquely identifying the request.  It may also be
    ``null`` or not present, in which case no response will be returned.

.. describe:: this

    A reference to the object whose method is to be invoked (see :ref:`object
    marshalling <marshal>`).  For calls to the ``LocalSessionManager`` (e.g.
    :ref:`open() <session>` and :ref:`free() <native_free>`), this may be
    ``null`` or not present.

.. describe:: method

    A string identifying the method to be invoked.

.. describe:: params

    An array of arguments to pass to the method.  May be not present if there
    are no arguments.


Response
^^^^^^^^

A response (method return) takes the following form:

.. sourcecode:: json

    {
        "dst": 2,
        "id": 3,
        "result": 42
    }

.. describe:: dst

    For responses to forwarded (bridged) calls, this is an integer identifying
    the origin of the call (the ``src`` of the request becomes the ``dst`` of
    the response).  For direct responses, this should be ``null`` or not
    present.

.. describe:: id

    An integer identifying the request to which this response corresponds.

.. describe:: result

    The return value of the call, or ``null`` if the method did not return a
    value.  If this property is missing, Eider will interpret the message as an
    error response.


Error Response
^^^^^^^^^^^^^^

If a method throws an exception, the response takes the following form:

.. sourcecode:: json

    {
        "dst": 2,
        "id": 3,
        "error": {
            "name": "TerribleGhastlyError",
            "message": "Don't Panic"
        }
    }

.. describe:: dst

    This has the same meaning as for successful responses.

.. describe:: id

    This has the same meaning as for successful responses.

.. describe:: error

    This is an object representing the thrown exception.  At minimum, it should
    have ``name`` and ``message`` string properties describing the type of
    error and any pertinent details.  It may also have a ``stack`` string
    property with a stack trace (the format of which is
    implementation-specific).

    Eider implementations may attempt to use the ``name`` field to convert the
    exception to an appropriate native exception type before passing it to
    client code.  They may also use the ``stack`` field as appropriate to
    simulate exception chaining.


.. _cancel:

Cancellation Request
^^^^^^^^^^^^^^^^^^^^

A request to cancel (i.e. abort) an outstanding method call takes the following
form:

.. sourcecode:: json

    {
        "dst": 1,
        "src": 2,
        "cancel": 3
    }

.. describe:: dst

    This has the same meaning as for method call requests.

.. describe:: src

    This has the same meaning as for method call requests.

.. describe:: cancel

    This is an integer identifying the request which the caller wishes to
    cancel.

Callees are not required to honor cancellation requests; they may still finish
the call and return a result or an error.  However, such results and errors
will be ignored by the caller.  There is no mechanism to acknowledge a
cancellation request; after sending it, the caller should not assume any
specific remote state was reached.  The Future or Promise representing the
remote call will have its exception immediately set to
``asyncio.CancelledError`` (Python) or ``Eider.Errors.CancelledError``
(JavaScript).


.. _format:

Serialization Formats
---------------------

By default, Eider expects all messages to be encoded in JSON format.  The
reference implementations also allow an alternative format to be specified when
creating a ``Connection`` object; however, the particular format to be used
must be either agreed upon in advance or transmitted through some side-channel.

Eider also includes a mechanism for specifying an alternative format on a
per-message basis.  To do this, the message must be split into two parts: a
header formatted in JSON (or the agreed-upon format, as above), and an
arbitrarily-formatted body.  These parts must be sent as separate WebSocket
messages, one immediately after the other.

To distinguish a message header from a complete message, and to specify the
format used for the subsequent body, the message header object must contain a
``format`` field.  This field should be a string identifying a serialization
format that the remote peer knows how to handle.  The string ``"json"`` should
be reserved for JSON and ``"msgpack"`` for MessagePack.

When the ``format`` field is present, the only other fields that the header
message should contain are ``dst``, ``src``, ``id``, and ``method``.  The
``this``, ``params``, ``result``, and ``error`` fields are expected to be
contained in the body message instead.  For example, the request above could be
transmitted as these two messages:

.. sourcecode:: json

    {
        "dst": 1,
        "src": 2,
        "id": 3,
        "method": "answer",
        "format": "json"
    }

.. sourcecode:: json

    {
        "this": {
            "__*__": 4,
            "rsid": 5
        },
        "params": [
            "life",
            "the universe",
            "everything"
        ]
    }

And the response could be transmitted as these two messages:

.. sourcecode:: json

    {
        "dst": 2,
        "id": 3,
        "format": "json"
    }

.. sourcecode:: json

    {
        "result": 42
    }

If the method throws an exception, the response could be:

.. sourcecode:: json

    {
        "dst": 2,
        "id": 3,
        "format": "json"
    }

.. sourcecode:: json

    {
        "error": {
            "name": "TerribleGhastlyError",
            "message": "Don't Panic"
        }
    }

Separating the header and body in this way yields an important benefit for
calls over a bridged session.  Because all the information needed to forward
messages between two peers (i.e., ``dst`` and ``src``) is contained within the
header, the bridging peer does not have to decode and re-encode the contents of
the message body when relaying a message.

Because it would quickly become tedious to have to specify the format for every
method call, the ``Connection.create_session()`` method allows you to specify
an ``lformat`` and ``rformat`` to be used for all method calls and responses
for objects in a given session.  The ``lformat`` specifies how outgoing
messages will be encoded, and the ``rformat`` is passed to the remote peer to
request how to encode its responses.


.. _marshal:

Marshalling References
----------------------

In addition to "plain old data" (strings, numbers, ``null``, arrays/lists,
objects/dictionaries), the ``this``, ``params``, and ``result`` fields of
requests and responses may contain *references* to objects, bound methods, and
bridged sessions.

References are represented as objects (dictionaries) containing a property
named ``"__*__"``, known as the `object-id`.  The root object of each session
has ``null`` as its `object-id`.  For all other objects, the `object-id` is an
integer uniquely identifying it within its session.

The way references are encoded depends on the chosen serialization format.  For
JSON, they are simply encoded "in-band" using the above representation.  For
MessagePack, the representation is encoded and then wrapped in `extension type
<https://github.com/msgpack/msgpack/blob/master/spec.md#types-extension-type>`_
``0``.  This extra level of indirection makes MessagePack a safer choice if the
data is coming from an unknown source, because it eliminates the possibility of
the ``"__*__"`` key colliding with plain old data.

.. warning:: When using JSON serialization, it is important to make sure that
    plain data objects passed through Eider do not contain properties named
    ``"__*__"``, as this may confuse the marshalling layer.  If this cannot be
    guaranteed, then use MessagePack or another serialization format that
    provides a way to distinguish between data and object references.

The Eider implementations handle the details of marshalling (encoding) and
unmarshalling (decoding) object references into and out of this representation.


Remote Objects
^^^^^^^^^^^^^^

Objects residing on the remote peer (such as ``this`` for a method call) are
represented like this:

.. sourcecode:: json

    {
        "__*__": 1,
        "rsid": 2
    }

Here, ``rsid`` is an integer uniquely identifying the remote session to which
the object belongs.


Local Objects
^^^^^^^^^^^^^

Similarly, objects residing on the local peer (such as the result of a
``new_*`` call, or a local reference passed for use as a callback) are
represented like this:

.. sourcecode:: json

    {
        "__*__": 1,
        "lsid": 2
    }

where ``lsid`` is an integer uniquely identifying the local session to which
the object belongs.


Bound Methods
^^^^^^^^^^^^^

References to bound methods of local and remote objects may also be included in
Eider messages.  The representation of the ``frobnicate`` method of a remote
object with `object-id` of ``1`` in remote session ``2`` would look like this:

.. sourcecode:: json

    {
        "__*__": 1,
        "rsid": 2,
        "method": "frobnicate"
    }

Change ``rsid`` to ``lsid`` to refer to a method of a local object instead.


Bridged Sessions
^^^^^^^^^^^^^^^^

When a peer `B` creates a bridged session between peers `A` and `C`, it is
passed back to peer `A` using this representation:

.. sourcecode:: json

    {
        "__*__": 1,
        "lsid": 2,
        "bridge": {
            "dst": 3,
            "rsid": 4,
            "lformat": "json"
        }
    }

The `object-id` and ``lsid`` fields identify the bridge object on peer `B`,
used to manage the lifetime of the bridge.  Within the ``bridge`` field, the
``dst`` field identifies peer `C`, the ``rsid`` field identifies the remote
session on peer `C`, and ``lformat`` is the requested serialization format for
peer `A` to use when making calls or responding to callbacks.


.. _session:

Session Management
------------------

When a connection is first established, there are no remote sessions yet, and
therefore no remote objects with methods to call.  With no methods to call, how
do you create a remote session?  The answer is that every Eider connection
provides a special session (with ``lsid`` of ``null``) whose root object
provides a special method:

.. py:method:: LocalSessionManager.open(lsid, lformat=None)

    Create a new session which may be subsequently identified with ``lsid``.
    Method call responses and callbacks originating from this session will be
    encoded using the requested ``lformat``.

It should not be necessary to call this method directly;
``Connection.create_session()`` will handle this for you.

A remote session is closed when its root object is released.  Again, this
should not be done directly, but rather by calling ``RemoteSession.close()`` or
using the session in a ``with`` statement (Python 3.4), ``async with``
statement (Python 3.5+), or ``Eider.using()`` (JavaScript).


.. _native_free:

Native Objects
--------------

The ``null`` session also provides a method that becomes important when passing
native objects and functions:

.. py:method:: LocalSessionManager.free(lsid, loid)

    Release the specified object.  For instances of ``LocalObject``, this is
    has the same effect as calling ``release()``.  For native objects, which do
    not participate in Eider's reference-counting protocol, this deletes the
    connection's internal reference to the object.  This method is called
    internally by ``RemoteObject._close()`` to mask the difference between
    ``LocalObject`` instances and native objects.
