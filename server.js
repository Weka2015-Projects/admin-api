import koa from 'koa'
import Resource from 'koa-resource-router'
import koaBody from 'koa-better-body'
import knex from 'koa-knex'
import mount from 'koa-mount'
import path from 'path'

const PORT = 4000

// Export the app for use in the tests
const app = module.exports = koa()

// Add the body parser to parse both multipart forms and JSON (for later use)
app.use(koaBody({
  extendTypes: {
    json: [ 'application/x-javascript' ],
  }
}))

app.use(knex({
  client: 'postgresql',
  connection: {
    database: 'text_invaders_dev'
  }
}))

const players = new Resource('players', {
  // GET /players
  index: function *(next) {
    // this.body = yield { players: this.knex('players') }
    this.body =  yield { players: this.knex('players') }
  },

  // POST /players
  create: function *(next) {
    try {
      // One method is to use knex to build the query for you
      const res = yield this.knex('players').returning('*').insert({
        name: this.request.body.fields.player.name,
        high_score: this.request.body.fields.player.high_score,
        created_at: new Date(),
        updated_at: new Date()
      })

      this.type = 'application/json'
      this.status = 201
      this.set('Location', `/players/${res[0].id}`)
      this.body = { player: res[0] }
    } catch (e) {
      console.log('error', e)
      this.status = 422
    }
  },

  // GET /players/:id
  show: function *(next) {
    let id = this.params.player
    // You can also write the SQL by hand and just use knex to send it
    const res = yield this.knex.raw('SELECT * FROM PLAYERS WHERE ID = ?', [id])
    if (res.rows.length === 1) {
      this.body = { player: res.rows[0] }
    } else {
      this.status = 404
    }
  },

  // PUT /players/:id
  update: function *(next) {
    const id = this.params.player
    const prevObj = yield this.knex.raw('SELECT * FROM PLAYERS WHERE ID = ?', [id]) 
    const res = yield this.knex('players').returning('*').where('id', id).update({
        name: this.request.body.fields.player.name || prevObj.rows[0].name,
        high_score: this.request.body.fields.player.high_score || prevObj.rows[0].high_score,
        updated_at: new Date()
      })
    if (res) {
      this.body = { player: res[0] }
    } else {
      this.status = 404
    }
  },

  // DELETE /players/:id
  destroy: function *(next) {
    const id = this.params.player
    const res = yield this.knex('players').returning('*').where('id', id).del()
    this.body = { message: `Deleted player with name of ${res[0].name} and id of ${id}` }
  }
})

const games = new Resource('games', {
  // GET /players
  index: function *(next) {
    // this.body = yield { players: this.knex('players') }
    this.body =  yield { games: this.knex('games') }
  },

  // POST /players
  create: function *(next) {
    try {
      // One method is to use knex to build the query for you
      const res = yield this.knex('games').returning('*').insert({
        content: this.request.body.fields.game.content,
        created_at: new Date(),
        updated_at: new Date()
      })
      this.type = 'application/json'
      this.status = 201
      this.set('Location', `/games/${res[0].id}`)
      this.body = { games: res[0] }
    } catch (e) {
      console.log('error', e)
      this.status = 422
    }
  },

  // GET /players/:id
  show: function *(next) {
    let id = this.params.game
    const res = yield this.knex.raw('SELECT * FROM GAMES WHERE ID = ?', [id])
    if (res.rows.length === 1) {
      this.body = { games: res.rows[0] }
    } else {
      this.status = 404
    }
  },

  // PUT /players/:id
  update: function *(next) {
    const id = this.params.game
    const prevObj = yield this.knex.raw('SELECT * FROM GAMES WHERE ID = ?', [id]) 
    const res = yield this.knex('games').returning('*').where('id', id).update({
        content: this.request.body.fields.game.content || prevObj.rows[0].content,
        updated_at: new Date()
      })
    if (res) {
      this.body = { game: res[0] }
    } else {
      this.status = 404
    }
  },

  // DELETE /players/:id
  destroy: function *(next) {
    const id = this.params.game
    const res = yield this.knex('games').returning('*').where('id', id).del()
    console.log(res)
    this.body = { message: `Deleted game with content of ${res[0].content} and id of ${id}` }
  }
})

const plays = new Resource('plays', {
  // GET /players
  index: function *(next) {
    // this.body = yield { players: this.knex('players') }
    this.body =  yield { plays: this.knex('plays') }
  },

  // POST /players
  create: function *(next) {
    try {
      // One method is to use knex to build the query for you
      const res = yield this.knex('plays').returning('*').insert({
        player_id: this.request.body.fields.play.player_id,
        game_id: this.request.body.fields.play.game_id,
        name: this.request.body.fields.play.name,
        score: this.request.body.fields.play.score,
        created_at: new Date(),
        updated_at: new Date()
      })
      this.type = 'application/json'
      this.status = 201
      this.set('Location', `/plays/${res[0].id}`)
      this.body = { plays: res[0] }
    } catch (e) {
      console.log('error', e)
      this.status = 422
    }
  },

  // GET /players/:id
  show: function *(next) {
    let id = this.params.play
    const res = yield this.knex.raw('SELECT * FROM PLAYS WHERE ID = ?', [id])
    if (res.rows.length === 1) {
      this.body = { plays: res.rows[0] }
    } else {
      this.status = 404
    }
  },

  // PUT /players/:id
  update: function *(next) {
    const id = this.params.play
    const prevObj = yield this.knex.raw('SELECT * FROM PLAYS WHERE ID = ?', [id]) 
    const res = yield this.knex('plays').returning('*').where('id', id).update({
        player_id: this.request.body.fields.play.player_id ||  prevObj.rows[0].player_id,
        game_id: this.request.body.fields.play.game_id ||  prevObj.rows[0].game_id,
        score: this.request.body.fields.play.score ||  prevObj.rows[0].score,
        name: this.request.body.fields.play.name ||  prevObj.rows[0].name,
        created_at: new Date(),
        updated_at: new Date()
      })
    if (res) {
      this.body = { player: res[0] }
    } else {
      this.status = 404
    }
  },

  // DELETE /players/:id
  destroy: function *(next) {
    const id = this.params.play
    const res = yield this.knex('plays').returning('*').where('id', id).del()
    console.log(res)
    this.body = { message: `Deleted play with a game id of ${res[0].game_id}, a player id of ${res[0].player_id} and id of ${id}` }
  }
})


app.use(mount('/api/v1', players.middleware()))
app.use(mount('/api/v1', games.middleware()))
app.use(mount('/api/v1', plays.middleware()))
// Start the application up on port PORT
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} . . .`)
})
