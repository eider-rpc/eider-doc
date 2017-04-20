import eider

class DuckTester(eider.LocalRoot):
    
    def is_it_a_duck(self, obj):
        return (obj['looks'] == 'like a duck' and
            obj['swims'] == 'like a duck' and
            obj['quacks'] == 'like a duck')

eider.serve(12345, root=DuckTester)
