.. concepts

.. _concepts:

Concepts
========

.. note:: For simplicity, in this document we will prefer the Python blocking (synchronous) API.
    The asynchronous JavaScript and Python APIs are very similar.

.. _outline:

Outline
-------

Typical Eider communication follows this basic pattern:

1. Establish a *connection*.
2. Create a remote *session* to contain object references.
3. Call a method on the *root object* of the session.
4. Call any other desired methods on the root object or on returned objects.
5. Close session(s) to reclaim memory.
6. Repeat 2-5 as desired.
7. (concurrently with 2-6) Execute any incoming method calls requested by the connection peer.
8. Close the connection.

Steps 2-7 are entirely optional; remember, every Eider peer can be a consumer of remote APIs (i.e.
a client), a provider of such APIs (i.e. a server), or both.

To illustrate these steps, here is an example of a client:

.. sourcecode:: python3

    >>> from eider import BlockingConnection
    >>> conn = BlockingConnection('ws://localhost:12345/')  # (1)
    >>> sess = conn.create_session()                        # (2)
    >>> oven = sess.root().new_Oven()                       # (3)
    >>> oven.cook('goose')                                  # (4)
    'your goose is cooked!'
    >>> sess.close()                                        # (5)
    >>> conn.close()                                        # (8)

And here is a corresponding server:

.. sourcecode:: python3

    import eider
    
    class Oven(eider.LocalObject):
        def cook(self, thing):
            return 'your ' + thing + ' is cooked!'          # (7)
    
    class OvenFactory(eider.LocalRoot):
        _newables = [Oven]
    
    eider.serve(12345, root=OvenFactory)

.. _conn:

Connection
----------

A ``Connection`` (or ``BlockingConnection``) object wraps a single WebSocket connection and handles
the details of parsing incoming messages and dispatching them to the appropriate handlers.  The
only things that can be done with a ``Connection`` object after it is created are to create new
sessions (local or remote), and to close the connection.  Closing the connection also closes any
related sessions.

.. _sess:

Session
-------

A ``LocalSession`` is a container for objects that may be remotely accessed.  A ``RemoteSession``
is a reference to a ``LocalSession`` provided by another peer.  Typically, sessions are created by
clients via ``Connection.create_session()``, but sessions may also be spontaneously created by
servers via ``Connection.create_local_session()``.

A ``BridgedSession`` is a special kind of ``RemoteSession`` that allows a peer `A` to access
another peer `C` through an intermediate peer `B`.  The bridge is created by the peer `B` by
creating a ``Bridge`` object (typically in response to a request by `A`) and passing it back to `A`
where it will be unmarshalled into a ``BridgedSession``.

The session's primary purpose is to serve as a garbage collection mechanism.  By maintaining a
collection of all objects reachable by a client, the server can release resources when the client
no longer needs them (either because the connection was dropped, or the session was explicitly
closed).  This also relieves most clients of the burden of having to explicitly release object
references, while allowing them to maintain a long-lived connection.

.. _root:

Root Object
-----------

Every session starts out with exactly one `root object` which serves as the origin for all further
use of the session.  In the above example, the root object is an instance of the ``OvenFactory``
class.

In addition to providing its own methods, the root object may allow new objects to be created.  In
the above example, the special ``_newables`` class member specifies classes for which the Eider
machinery will automatically create ``new_Foo()`` factory methods on the root object.  The root
object can also explicitly define methods that return new objects.

The root object's lifetime coincides with that of its session.  When the root object is released,
its session is closed, and vice versa.

.. _object:

Objects
-------

A ``LocalObject`` is a server-side object that lives within a ``LocalSession`` and may be remotely
accessed.  A ``RemoteObject`` is a client-side reference to a ``LocalObject`` provided by another
peer.  Objects are reference-counted, may be explicitly released, and are implicitly cleaned up
when the session in which they were created is closed.

Object class definitions follow the normal syntax, semantics, and conventions of their host
languages, with one important exception: any property that does not begin with an underscore
(``_``) will be remotely callable as a method.  Data members and private methods should always be
prefixed with ``_``.

Every object inherits a few basic methods:

.. py:method:: LocalObject.addref()

    Increment the object's reference count.  It should almost never be necessary to explicitly call
    this method.

.. py:method:: LocalObject.release()

    Decrement the object's reference count.  It should almost never be necessary to explicitly call
    this method.

.. py:method:: LocalObject.help()
               LocalObject.<method>.help()

    Get documentation for the object or one of its methods.  In Python, this returns the docstring;
    in JavaScript, it returns the class's or method's ``help`` property, if any.

.. py:method:: LocalObject.dir()

    Get a list of names of the object's methods.

.. py:method:: LocalObject.taxa()

    Get a list of names of the object's base classes.

.. py:method:: LocalObject.<method>.signature()

    Get the type signature of a method.  This uses `PEP 484
    <https://www.python.org/dev/peps/pep-0484/>`_-style type hints in Python.  The JavaScript
    implementation only returns basic information.

Instances of ``RemoteObject``, in addition to allowing the methods of the referenced object to be
called, have this local method:

.. py:method:: RemoteObject._close()

    Release the object without waiting for garbage collection.  This guards against
    double-releasing and gracefully handles dropped connections.  This should normally be called
    instead of directly calling ``release()``.  Despite the leading underscore in the name, client
    code may call this function.  The underscore merely exists to differentiate this from a remote
    method.

Both ``LocalObject`` and ``RemoteObject`` also support the context manager protocol, so they can be
used in the ``with`` statement in Python and ``Eider.using()`` in JavaScript.

.. _call:

Method Calls
------------

In the Python blocking API (where ``BlockingConnection``, ``BlockingSession``, and
``BlockingObject`` are substituted for ``Connection``, ``RemoteSession``, and ``RemoteObject``),
remote method calls block until a value is returned or an exception is raised.  In the asynchronous
APIs, each method call returns a Future (Python) or Promise (JavaScript) representing the eventual
result or exception.  These objects are equipped with a ``cancel()`` method that can be used to
send a :ref:`cancellation request <cancel>` for the call.
