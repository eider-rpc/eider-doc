.. Eider documentation master file

Eider
=====

Eider is an object-oriented, asynchronous, late-binding, web-first, polyglot
RPC protocol.  Eider is also the name of the reference implementations in
Python and JavaScript.

Out of the box, Eider uses `WebSockets <https://tools.ietf.org/html/rfc6455>`_
for transport and `JSON <http://www.json.org/>`_ or `MessagePack
<http://msgpack.org/>`_ for serialization.  The core protocol and concepts are
transport- and format-neutral.

With Eider, developing applications that combine server-side, client-side, and
in-browser code is duck soup!


.. _install:

Installation
------------

Python
^^^^^^

The `eider <https://pypi.org/project/eider/>`_ package currently targets
`Python <https://www.python.org/>`_ 3.7+ (for Python 3.4-3.6, `eider 1.x
<https://pypi.org/project/eider/#history>`_ is largely compatible).  Requires
either `aiohttp <http://aiohttp.readthedocs.io/>`_ or `websockets
<http://websockets.readthedocs.io/>`__.  Includes elective support for
MessagePack using `msgpack-python
<https://github.com/msgpack/msgpack-python>`_, if available.

.. sourcecode:: sh

    pip install eider

    # either:
    pip install aiohttp  # recommended
    pip install websockets  # slower

    # optional:
    pip install msgpack

You can also check out the `source code on GitHub
<https://github.com/eider-rpc/eider-py>`__.


JavaScript
^^^^^^^^^^

The `eider-rpc <https://npm.io/package/eider-rpc>`_ package targets `Node.js
<https://nodejs.org/>`_ 6+, modern browsers, and any other
environment that supports `ES6 <http://kangax.github.io/compat-table/es6/>`_.

For clients, no external libraries are strictly required.  Node.js servers need
the `ws <https://www.npmjs.com/package/ws>`_ package.  Other optional
dependencies are `msgpack-lite <https://www.npmjs.com/package/msgpack-lite>`_
for MessagePack encoding and `weak <https://www.npmjs.com/package/weak>`_ for
implicit remote garbage collection.

.. sourcecode:: sh

    npm install eider-rpc

    # for servers:
    npm install ws

    # optional:
    npm install msgpack-lite
    npm install weak

For the browser: `eider-rpc.min.js <eider-rpc.min.js>`_.

You can also check out the `source code on GitHub
<https://github.com/eider-rpc/eider-js>`__.


C++
^^^

The `eider-pybind11 <https://github.com/eider-rpc/eider-pybind11>`_ project
provides a simple header file that can enable classes implemented in C++ to be
served over Eider connections using `pybind11
<http://pybind11.readthedocs.io/>`_.


.. _getting_started:

Getting Started
---------------

Python
^^^^^^

Here is a simple server (:download:`simple_server.py
<examples/simple_server.py>`):

.. literalinclude:: examples/simple_server.py
    :language: python3
    :linenos:

And here is a corresponding client (:download:`simple_client.py
<examples/simple_client.py>`):

.. literalinclude:: examples/simple_client.py
    :language: python3
    :linenos:

And here is an equivalent client using non-blocking APIs:
(:download:`simple_client_async.py <examples/simple_client_async.py>`):

.. literalinclude:: examples/simple_client_async.py
    :language: python3
    :linenos:


JavaScript
^^^^^^^^^^

Here is an equivalent server in JavaScript (:download:`simple_server.js
<examples/simple_server.js>`):

.. literalinclude:: examples/simple_server.js
    :language: javascript
    :linenos:

And here is an equivalent client (`simple_client.html
<simple_client.html>`_):

.. literalinclude:: examples/simple_client.html
    :language: html
    :linenos:
    :lines: 7-18

And here is an equivalent client using ``async``/``await`` syntax
(`simple_client_async.html <simple_client_async.html>`_):

.. literalinclude:: examples/simple_client_async.html
    :language: html
    :linenos:
    :lines: 7-19


C++
^^^

Here is how the core of the Python server could be written in C++
(:download:`simple_server.cpp <examples/simple_server.cpp>`):

.. literalinclude:: examples/simple_server.cpp
    :language: c++
    :linenos:


.. _toc:

Contents
--------

.. toctree::

    yarp
    concepts
    protocol
    sugar


Blame
-----

Eider began as an internal software library at `ON Semiconductor
<http://onsemi.com>`_ and was open-sourced under the `Apache License 2.0
<http://www.apache.org/licenses/LICENSE-2.0>`_ in April 2017.

`Bart Robinson <https://github.com/wemoloh>`_ is the original author and
current maintainer.

King Eider photo by `Ron Knight <https://flic.kr/p/mPLgy8>`_
(`CC BY 2.0 <https://creativecommons.org/licenses/by/2.0/>`_).
