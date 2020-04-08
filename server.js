const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');


const app = express();
app.use(express.json());
app.use(cors())

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'vishaldhileepan',
        password: '',
        database: 'mergen-first-db'
    }
});

app.get('/', (req, res) => {
    res.send(database.users)
})

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password,data[0].hash)
        if (isValid){
            return db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        }
        else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json('wrong wtf'))
});

app.post('/register', (req, res) => {
    const { email, password, name } = req.body;
    const hash = bcrypt.hashSync(password)
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email,
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                return trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0],
                        name: name,
                    })
                    .then(user => {
                        res.json(user[0]);
                    })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('unable to register'))
})

app.listen(3000, () => {
    console.log('server running on port 3000')
})