import express from 'express'
import cohere from 'react-cohere'
import bodyParser from 'body-parser'
import routes from './routes'

const app = express()
const renderer = cohere({ routes })

app.use(bodyParser.json({ limit: '2mb' }))
app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }))
app.get('*', renderer)

app.listen(8000, (err) => {
  if (err) {
    return console.error(`👎  ${err}`)
  }

  console.info(`👍  Server launched at: localhost:8000`)
})
