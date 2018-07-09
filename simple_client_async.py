import asyncio, eider

how = 'like a duck'
obj = {'looks': how, 'swims': how, 'quacks': how}

async def ducktest():
    async with eider.Connection('ws://localhost:12345') as conn:
        async with conn.create_session() as duck_tester:
            is_duck = await duck_tester.is_it_a_duck(obj)

    print("It's probably " + ("" if is_duck else "NOT ") + "a duck.")

asyncio.get_event_loop().run_until_complete(ducktest())
