'user strict'
import redis from './redis';

const redisClient = redis.createClient({ db: 14 });


class Base {

    constructor() {
    }

}

export default Base;