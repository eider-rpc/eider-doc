import eider

how = 'like a duck'
obj = {'looks': how, 'swims': how, 'quacks': how}

with eider.BlockingConnection('ws://localhost:12345') as conn:
    with conn.create_session() as duck_tester:
        is_duck = duck_tester.is_it_a_duck(obj)
        print("It's probably " + ("" if is_duck else "NOT ") + "a duck.")
