import {Connection, Repository} from 'typeorm';
import {createMemDB} from "../utils/createMemDB";
import {Stores} from "../stores/entities/stores.entity";
import {User} from "../user/entities/user.entity";
import {StoresService} from "./stores.service";
import {Payment} from "../payment/entities/payment.entity";
import {Transaction} from "../transaction/entities/transaction.entity";


describe('Stores Service', () => {
    let db: Connection
    let storesService: StoresService
    let storesRepo: Repository<Stores>
    let userRepo: Repository<User>
    let paymentRepo: Repository<Payment>

    beforeAll(async () => {

        db = await createMemDB([Stores, User, Payment, Transaction])
        storesRepo = await db.getRepository(Stores)
        storesService = new StoresService(storesRepo)
        userRepo = await db.getRepository(User)

        await Stores.delete({})

    })

    afterAll(() => db.close());

    it('find store by Api Key', async () => {

        const user = {
            name: "1",
            lastName: "1",
            email: "mail@gmail.com",
            token: "$2b$07$PUx7RK/NjXwo7i9xpYT2vejPjU3A4hxCCvYYkDbZ/fcfgyFnCw9f.",
            role: 'customer',
            // id: 60,
            password: "5ZlEqFyVD4XMnxJsSFZf2Yra1k3m44o1E59v",
            company: "mail.ru",
            blocked: false,
        };

        const newUser = await userRepo.save(user);

        const store = {
            name: "Store test",
            description: "Good store",
            url: "https://lms.sfedu.ru/my/",
            apiKey: "FL1f0BNoBB3qRQ4dKtzwNgmdT95qJniM89Ak123",
            user: newUser,
            wallet: "01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9",
            blocked: false
        }

        const newStore = await storesRepo.save(store);


        const stores = await storesService.findStore(newStore.apiKey);

        const storeRes = stores;

        expect(storeRes).toHaveProperty("id")
        expect(storeRes.name).toEqual("Store test")
        expect(storeRes.description).toEqual("Good store")
        expect(storeRes.url).toEqual("https://lms.sfedu.ru/my/")
        expect(storeRes.apiKey).toEqual("FL1f0BNoBB3qRQ4dKtzwNgmdT95qJniM89Ak123")
        expect(storeRes.wallet).toEqual("01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9")

    })

    it('should throw an exception if invalide Api Key', async () => {

        const user = {
            name: "1",
            lastName: "1",
            email: "mail@gmail.com",
            token: "$2b$07$PUx7RK/NjXwo7i9xpYT2vejPjU3A4hxCCvYYkDbZ/fcfgyFnCw9f.",
            role: 'customer',
            // id: 60,
            password: "5ZlEqFyVD4XMnxJsSFZf2Yra1k3m44o1E59v",
            company: "mail.ru",
            blocked: false,
        };

        const newUser = await userRepo.save(user);

        const store = {
            name: "Store test",
            description: "Good store",
            url: "https://lms.sfedu.ru/my/",
            apiKey: "FL1f0BNoBB3qRQ4dKtzwNgmdT95qJniM89Ak123",
            user: newUser,
            wallet: "01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9",
            blocked: false
        }

        await storesRepo.save(store);


        try {
            await storesService.findStore('KEY12');
        } catch (e) {
            expect(e).toHaveProperty('message', 'store with this API not exist');
        }

    })

})
