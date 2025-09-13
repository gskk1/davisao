import { NextRequest, NextResponse } from 'next/server';

import axios from 'axios';
import fs from 'fs';
import https from 'https';

const clientId = process.env.INTER_CLIENT_ID!;
const clientSecret = process.env.INTER_CLIENT_SECRET!;
const contaCorrente = process.env.INTER_CONTA_CORRENTE!;
const certPath = process.env.INTER_CERT_PATH!;
const keyPath = process.env.INTER_KEY_PATH!;
const chavePix = '54987304000113';
const webhookUrl = 'https://webhook-test.com/218074f00aaa1039fa474bf8c21fb83d'; // url de teste para webhook

async function getWebhookPix() {
  const requestBody = `client_id=${clientId}&client_secret=${clientSecret}&scope=webhook.read&grant_type=client_credentials`;
  const agent = new https.Agent({
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  });

  const tokenResponse = await axios.post(
    'https://cdpj.partners.bancointer.com.br/oauth/v2/token',
    requestBody,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent: agent,
    }
  );
  const token = tokenResponse.data.access_token;

  const response = await axios.get(
    `https://cdpj.partners.bancointer.com.br/pix/v2/webhook/${chavePix}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-conta-corrente': contaCorrente,
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
    }
  );

  console.log('Webhook =', response.data);
  return response.data;
}

async function criarWebhookPix() {
  const requestBody = `client_id=${clientId}&client_secret=${clientSecret}&scope=webhook.write&grant_type=client_credentials`;
  const agent = new https.Agent({
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  });

  const tokenResponse = await axios.post(
    'https://cdpj.partners.bancointer.com.br/oauth/v2/token',
    requestBody,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent: agent,
    }
  );
  const token = tokenResponse.data.access_token;
  console.log('Token obtido para webhook:', token);
  const emitirBody = {
    webhookUrl: webhookUrl,
  };

  const response = await axios.put(
    `https://cdpj.partners.bancointer.com.br/pix/v2/webhook/${chavePix}`,
    emitirBody,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-conta-corrente': contaCorrente,
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
    }
  );

  console.log('Webhook cadastrado:', response);
}

export async function GET() {
  const resultado = await getWebhookPix();
  return NextResponse.json(resultado);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('Recebido do webhook Pix:', body);

  return NextResponse.json({ received: true });
}

export async function PUT() {
  await criarWebhookPix();

  return NextResponse.json({ received: true });
}
