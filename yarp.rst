.. YARP

.. _yarp:

Justification
=============

(a.k.a. Yet another RPC protocol?)

There are many Remote Procedure Call mechanisms out there.  Some of them are
very nice.  Eider was developed because, as far as the author could tell, no
single one of them meets all five of these criteria:

    * **Object-oriented**.  Many RPC protocols only allow you to call a flat
      list of exposed *functions*.  Eider lets you work with remote *objects*
      and their exposed *methods*.
    * **Asynchronous**.  Many RPC protocols require that responses be returned
      in the same order as requests were sent.  Eider allows responses to be
      returned in any order, using asynchronous fulfillment mechanisms such as
      `Promises
      <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise>`_
      (in JavaScript) and `Futures
      <https://docs.python.org/3/library/asyncio-task.html>`_ (in Python).
    * **Late-binding**.  Many RPC protocols require invokable function
      signatures to be declared ahead of time in some special way.  Eider has
      no such requirement; instead it follows the Python tradition of `duck
      typing <https://en.wikipedia.org/wiki/Duck_typing>`_ (if it looks like a
      duck, swims like a duck, and quacks like a duck... it's probably a duck).
      There is no interface description language; exposed objects and methods
      are coded using the natural syntax of their native language.  Type
      mismatches are reported via exceptions at runtime. [#]_
    * **Web-first**.  Many RPC protocols use direct TCP or pipe connections and
      rely on custom binary formats or overly-verbose XML, all of which make
      them difficult-to-impossible to use from JavaScript running inside the
      browser.  Eider uses web standards like `WebSockets
      <https://tools.ietf.org/html/rfc6455>`_ and `JSON
      <http://www.json.org/>`_, so client-side web apps can be first-class
      participants in an Eider-based system.
    * **Polyglot**.  Many RPC protocols are tied to a single programming
      language.  Eider is language-agnostic.

Eider also has these nice features:

    * **Lightweight**.  The Python and JavaScript implementations are just a
      few kilobytes each and have minimal external dependencies.  Transmitted
      messages are nearly as compact as in `JSON-RPC <http://json-rpc.org/>`_.
    * **Natural syntax.**  Syntactic sugar is used to make calling remote
      methods and accessing remote properties as natural as possible.  The
      Python implementation also provides blocking versions of client
      functions, so simple clients can avoid the complexity of Futures and
      callbacks.
    * **Peer-to-peer**.  After the initial connection, there is no functional
      difference between client and server applications.  Each peer can be both
      a provider and consumer of remote interfaces.  Callbacks are even
      supported, where a locally-provided object or method is passed to a
      remote interface.
    * **Built-in proxying**.  Any Eider peer can act as a bridge between any
      two of its peers, allowing them to call each other's methods without
      connecting directly.
    * **Cancellation**.  Eider consumers can request the graceful cancellation
      of long-running remote method calls without terminating the connection or
      losing session state.


.. rubric:: Footnotes

.. [#] It is important not to confuse *late binding* with *weak typing*.  Eider
    methods are precisely as strongly typed as the language used to implement
    them.  To assist with coding discipline, Eider has built-in support for
    function annotation, interactive help, and runtime object inspection.
