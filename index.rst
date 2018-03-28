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

Requires `Python <https://www.python.org/>`_ 3.4+ and `aiohttp
<http://aiohttp.readthedocs.io/en/stable/>`_.  Includes elective support for
MessagePack using `msgpack-python
<https://github.com/msgpack/msgpack-python>`_, if available.

.. sourcecode:: bat

    pip install eider

You can also check out the `source code on GitHub
<https://github.com/eider-rpc/eider-py>`__.


JavaScript
^^^^^^^^^^

Works in `Node.js <https://nodejs.org/>`_ 6+, modern browsers, and any other
environment that supports `ES6 <http://kangax.github.io/compat-table/es6/>`_.

No external libraries are strictly required.  Elective support is included for
WebSocket creation using `ws <https://www.npmjs.com/package/ws>`_ and
MessagePack using `msgpack-lite <https://www.npmjs.com/package/msgpack-lite>`_,
if available.  Implicit remote garbage collection
is supported if the `weak <https://www.npmjs.com/package/weak>`_ package is
available.

.. sourcecode:: bat

    npm install eider-rpc

For the browser: `eider-rpc.min.js <eider-rpc.min.js>`_.

You can also check out the `source code on GitHub
<https://github.com/eider-rpc/eider-js>`__.


C++
^^^

The `eider-pybind11 <https://github.com/eider-rpc/eider-pybind11>`_ project
provides a simple header file that can enable classes implemented in C++ to be
served over Eider connections using `pybind11
<http://pybind11.readthedocs.io/en/latest>`_.


.. _getting_started:

Getting Started
---------------

Here is a simple server in Python (:download:`simple_server.py
<simple_server.py>`):

.. literalinclude:: simple_server.py
    :language: python3
    :linenos:

And here is an equivalent server in JavaScript (:download:`simple_server.js
<simple_server.js>`):

.. literalinclude:: simple_server.js
    :language: javascript
    :linenos:

Here is how the core of the Python server could be written in C++
(:download:`simple_server.cpp <simple_server.cpp>`):

.. literalinclude:: simple_server.cpp
    :language: c++
    :linenos:

Here is a client in Python (:download:`simple_client.py <simple_client.py>`):

.. literalinclude:: simple_client.py
    :language: python3
    :linenos:

And here is an equivalent client in JavaScript (`simple_client.html
<simple_client.html>`_):

.. literalinclude:: simple_client.html
    :language: html
    :linenos:
    :lines: 7-18

And finally, here is a Python 3.5+ client using non-blocking APIs
(:download:`simple_client_async.py <simple_client_async.py>`):

.. literalinclude:: simple_client_async.py
    :language: python3
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

`Bart Robinson <http://bartrobinson.com>`_ is the original author and current
maintainer.

King Eider photo by `Ron Knight <https://flic.kr/p/mPLgy8>`_
(`CC BY 2.0 <https://creativecommons.org/licenses/by/2.0/>`_).
