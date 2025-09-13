import axios from 'axios';
import fs from 'fs';
import https from 'https';
import { NextRequest, NextResponse } from 'next/server';

const clientId = process.env.INTER_CLIENT_ID!;
const clientSecret = process.env.INTER_CLIENT_SECRET!;
const contaCorrente = process.env.INTER_CONTA_CORRENTE!;
const certPath = process.env.INTER_CERT_PATH!;
const keyPath = process.env.INTER_KEY_PATH!;


interface EmitirPixCobrancaParamsType {
  expiracao?: number;
  devedor: {
    cnpj?: string;
    cpf?: string;
    nome: string;
  };
  valor: {
    original: string;
    modalidadeAlteracao?: number;
  };
  chave: string;
  solicitacaoPagador?: string;
  infoAdicionais?: Array<{ nome: string; valor: string }>;
}

//o token gerado tem duracao de 1 hora para o tipo de operacao que voce faz.
async function getToken() {
  const requestBody = `client_id=${clientId}&client_secret=${clientSecret}&scope=cob.write&grant_type=client_credentials`;
  const agent = new https.Agent({
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  });

  const response = await axios.post(
    'https://cdpj.partners.bancointer.com.br/oauth/v2/token',
    requestBody,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent: agent,
    }
  );
  return response.data.access_token;
}

// Função para consultar cobrança Pix, Tinha feito isso aqui pra caso a consulta com webhook nao funcionasse
export async function getPixCobranca(txid: string) {
  const token = await getToken();
  const agent = new https.Agent({
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  });

  const response = await axios.get(
    `https://cdpj.partners.bancointer.com.br/pix/v2/cob/${txid}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-conta-corrente': contaCorrente,
        'Content-Type': 'application/json',
      },
      httpsAgent: agent,
    }
  );
  return response.data;
}

export async function emitirPixCobranca({
  expiracao = 3600,
  devedor,
  valor,
  chave,
  solicitacaoPagador,
  infoAdicionais = [],
}: EmitirPixCobrancaParamsType) {
  const token = await getToken();
  const agent = new https.Agent({
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  });

  const payload = {
    calendario: { expiracao },
    devedor,
    valor,
    chave,
    solicitacaoPagador,
    infoAdicionais,
  };

  console.log('Payload enviado para a API do Inter:', payload);
  try {
    const response = await axios.post(
      'https://cdpj.partners.bancointer.com.br/pix/v2/cob',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-conta-corrente': contaCorrente,
          'Content-Type': 'application/json',
        },
        httpsAgent: agent,
      }
    );
    console.log('Resposta da API do Inter:', response.data);
    return response.data;
  } catch (error) {
    console.log('Erro ao emitir cobrança Pix:', error);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const resultado = await emitirPixCobranca(body);

  return NextResponse.json(resultado);
}
