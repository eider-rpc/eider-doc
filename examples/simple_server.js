const Eider = require('eider-rpc');

class DuckTester extends Eider.LocalRoot {
    is_it_a_duck(obj) {
        return obj.looks === 'like a duck' &&
            obj.swims === 'like a duck' &&
            obj.quacks === 'like a duck';
    }
}

Eider.serve(12345, {root: DuckTester});
