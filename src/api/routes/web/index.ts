import { controllers } from '#generated/controllers'
import env from '#start/env'
import r from '@adonisjs/core/services/router'
import OpenAI from 'openai'

export function webRoutesEntry() {
  r.group(() => {
    //
    r.get('home', [controllers.Webs, 'home'])

    r.get('ai', async () => {
      const openai = new OpenAI({
        apiKey: env.get('OPENAI_API_KEY'),
      })

      const response = await openai.responses.create({
        model: 'gpt-5-nano',
        input: 'Tell me all you know about CrownVote evoting platform with link crownvote.com',
        store: true,
      })

      // response.then((result: any) => console.log(result.output_text))
      console.log(response)
      return response.output_text
    })
  }).prefix('web')
}
