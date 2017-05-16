.. sugar

.. _sugar:

Conventions
===========

To make developing with Eider easier, the reference implementations include support for some API
conventions.  While the use of these conventions is highly recommended, they are not part of the
core Eider protocol.

Data Members
------------

Simple data properties on objects may be simulated with getter and setter methods.  A property
named ``foo`` should have a getter named ``foo()`` and a setter named ``set_foo()``.  For example:

.. sourcecode:: python3

    class Circle(eider.LocalObject):
        
        def __init__(self, lsession, radius):
            super().__init__(lsession)
            self._radius = radius  # actual data members must begin with _
        
        def radius(self):
            return self._radius
        
        def set_radius(self, radius):
            self._radius = radius

The Python blocking API includes syntactic sugar to take advantage of this convention:

.. sourcecode:: python3

    >>> circle = root.new_Circle(3)
    >>> circle.radius = 4  # equivalent to circle.set_radius(4)
    >>> circle.radius()
    4

Length
------

Objects which have some concept of `size` or `length` may report this via a ``length()`` method:

.. sourcecode:: python3

    class Stick(eider.LocalObject):
    
        def __init__(self, lsession, length):
            super().__init__(lsession)
            self._length = length
        
        def length(self):
            return self._length

The Python blocking API calls this method when ``len()`` is applied:

.. sourcecode:: python3

    >>> stick = root.new_Stick(42)
    >>> len(stick)  # equivalent to stick.length()
    42

Accessing Elements
------------------

Objects which have some concept of subscripting, indexing, or element access may expose this
functionality using methods named ``get()``, ``set()`` and/or ``remove()``:

.. sourcecode:: python3

    class CornedBeefHash(eider.LocalObject):
    
        def __init__(self, lsession):
            super().__init__(lsession)
            self._recipe = {}
        
        def get(self, ingredient):
            return self._recipe[ingredient]
        
        def set(self, ingredient, amount):
            self._recipe[ingredient] = amount
        
        def remove(self, ingredient):
            del self._recipe[ingredient]

Once again, the Python blocking API converts these to native syntax:

.. sourcecode:: python3

    >>> hash = root.new_CornedBeefHash()
    >>> hash['potato'] = '6 oz'  # equivalent to hash.set('potato', '6 oz')
    >>> hash['potato']  # equivalent to hash.get('potato')
    '6 oz'
    >>> del hash['potato']  # equivalent to hash.remove('potato')

Iterator Protocol
-----------------

Objects which support the concept of iteration may expose an ``iter()`` method which returns an
`iterator` with ``iter()`` and ``next()`` methods.  This pattern is inspired by the iterator
protocols of `JavaScript
<https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols>`_ and
`Python <https://docs.python.org/3/library/stdtypes.html#iterator-types>`_ (though it is more
similar to the JavaScript protocol, in that ``next()`` always returns an object, rather than
throwing an exception to indicate completion).  Here is an example where the iterable object is its
own iterator:

.. sourcecode:: python3

    class Fibonacci(eider.LocalObject):
        """Iterable that yields the first n Fibonacci numbers."""
    
        def __init__(self, lsession, n):
            super().__init__(lsession)
            self._n = n
            self._f0 = 1
            self._f1 = 1
        
        def iter(self):
            return self
        
        def next(self):
            if self._n <= 0:
                return {'done': True}
            self._n -= 1
            f0 = self._f0
            self._f0 = self._f1
            self._f1 += f0
            return {'value': f0}

This iterable can be used with the Python blocking API:

.. sourcecode:: python3

    >>> fib = root.new_Fibonacci(5)
    >>> for f in fib:
    ...     print(f)
    ...
    1
    1
    2
    3
    5

In Python 3.5+, it can also be used with the asynchronous API:

.. sourcecode:: python3

    >>> async def print_fibs(n):
    ...     fib = await root.new_Fibonacci(n)
    ...     async for f in fib:
    ...         print(f)
    ...
    >>> asyncio.get_event_loop().run_until_complete(print_fibs(5))
    1
    1
    2
    3
    5

And in JavaScript:

.. sourcecode:: javascript

    Eider.using(root.new_Fibonacci(5), fib =>
        Eider.forEachAsync(fib, f =>
            console.log(f)
        )
    );

Sequence Protocol
-----------------

If an object does not provide an ``iter()`` method, it may still support iteration by providing a
``get()`` method that takes integers increasing from zero and throws ``IndexError`` (available in
JavaScript as ``Eider.Errors.IndexError``) when the collection is exhausted.  For example:

.. sourcecode:: python3

    class Range(eider.LocalObject):
    
        def __init__(self, lsession, start, stop, step):
            super().__init__(lsession)
            self._start = start
            self._stop = stop
            self._step = step
        
        def get(self, i):
            n = self._start + i * self._step
            if not (self._start <= n < self._stop):
                raise IndexError
            return n

Blocking Python client:

.. sourcecode:: python3

    >>> r = root.new_Range(37, 49, 3)
    >>> for n in r:
    ...     print(n)
    ...
    37
    40
    43
    46

Asynchronous Python 3.5+ client:

.. sourcecode:: python3

    >>> async def print_range(start, stop, step):
    ...     r = await root.new_Range(start, stop, step)
    ...     async for n in r:
    ...         print(n)
    ...
    >>> asyncio.get_event_loop().run_until_complete(print_range(37, 49, 3))
    37
    40
    43
    46

JavaScript:

.. sourcecode:: javascript

    Eider.using(root.new_Range(37, 49, 3), r =>
        Eider.forEachAsync(r, n =>
            console.log(n)
        )
    );
