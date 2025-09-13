'use client';

import axios from "axios";
import { useState } from "react";


export default function Home() {
  const [pixCode, setPixCode] = useState("");

  function handleOnClickGeneratePix() {
  axios.post('/api/pix', {
    expiracao: 3600, // 60 min de validacao
    devedor: { cpf: '111111111111', nome: 'Empresa de Serviços SA' },
    valor: { original: '0.10'},
    chave: '11111111111111',
    solicitacaoPagador: 'Serviço realizado davisao.',
    infoAdicionais: [
      { nome: 'Campo 1', valor: 'qualquer coisa' },
      { nome: 'Campo 2', valor: 'qualuqer coisa' }
    ]
  })
    .then(response => {
        setPixCode(response.data.pixCopiaECola);    })
    .catch(error => {
      console.error('ouvi um erro', error);
    });
}

function handleOnClickCreateWebhook() {
  axios.put('/api/pix/webhook')
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error('ouvi um erro', error);
    });
}

function handleOnClickGetWebhook() {
  axios.get('/api/pix/webhook')
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.error('ouvi um erro', error);
    });
}

  return (
    <>
    <div className="flex flex-col justify-center items-center min-h-screen gap-4">
      <button onClick={handleOnClickGeneratePix}>Gerar pix</button>
            {pixCode && (
        <div>
          <textarea value={pixCode} className="w-80 h-20" />
        </div>
      )}

      <button onClick={handleOnClickCreateWebhook}>Criar Webhook</button>

      <button onClick={handleOnClickGetWebhook}>Get Webhook</button>

    </div>
  </>
  );
}
