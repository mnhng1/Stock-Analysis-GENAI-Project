/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
interface MyEnv {
	OPENAI_API_KEY: string;
  }

import OpenAI from 'openai'

const corsHeaders = {
	'Access-Control-Allow-Origin' : '*',
	'Access-Control-Allow-Methods' : 'POST, OPTIONS ',
	'Access-Control-Allow-Headers' : 'Content-Type'
};


export default {
	async fetch(request, env: MyEnv, ctx): Promise<Response> {
		
		if (request.method === 'OPTIONS') {
			return new Response(null, {headers: corsHeaders})
		}

		if (request.method  !== 'POST') {
			return new Response(JSON.stringify({error: `${request.method} method not allowed.`}), {status: 405, headers: corsHeaders})
		}

		const openai = new OpenAI({
			apiKey: env.OPENAI_API_KEY,
			baseURL: "https://gateway.ai.cloudflare.com/v1/0ed0afa2c3c81d9ba9c9a7cc66709b2d/openai-api/openai"
		  });


		const message: OpenAI.ChatCompletionMessageParam[] = await request.json()
 
		try{
			const chatCompletion = await openai.chat.completions.create({
				model: 'gpt-3.5-turbo',
				messages: message,
				temperature: 1.1,
				presence_penalty: 0,
				frequency_penalty: 0
			})

			const response = chatCompletion.choices[0].message;

			return new Response(JSON.stringify(response),{ headers: corsHeaders } )
		} catch(e) { 
			return new Response(e? e.toString() : "unknown error",  { status: 500,  headers: corsHeaders } )
		}

		

		
	},
} satisfies ExportedHandler<MyEnv>;
