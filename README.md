# Meus Ganhos

Aplicativo simples para registrar quanto se ganha por dia, quantas horas foram trabalhadas e acompanhar como o mês está indo.

- **Registrar**: valor do dia, horas e minutos trabalhados, observação opcional. Dá para registrar mais de um ganho no mesmo dia.
- **Mês**: total, comparação com o mês anterior, meta, médias e gráficos (por dia e acumulado).
- **Contas**: as contas do mês (aluguel, luz, internet...), cada uma com valor e dia de vencimento. Toque no círculo para marcar como paga. Mostra quanto falta pagar, o que está atrasado e quanto sobra dos ganhos depois das contas.
- **Evolução**: ganhos mês a mês, ganho por hora e quais dias da semana rendem mais.
- **Histórico**: todos os registros, com edição e exclusão.
- **Ajustes**: nome, meta do mês, backup, restauração e exportação para planilha.

Não tem login nem servidor. Os dados ficam no aparelho (localStorage do navegador).

## Publicar no GitHub Pages

1. Crie um repositório novo no GitHub (pode ser privado ou público, por exemplo `meus-ganhos`).
2. Envie **todos os arquivos desta pasta** para a raiz do repositório (botão *Add file > Upload files*).
3. No repositório, abra **Settings > Pages**.
4. Em *Build and deployment*, escolha **Deploy from a branch**, branch **main** e pasta **/ (root)**. Salve.
5. Espere um ou dois minutos. O endereço aparece na mesma tela, algo como `https://SEU-USUARIO.github.io/meus-ganhos/`.

Páginas em repositório privado exigem plano pago do GitHub. No plano gratuito, o repositório precisa ser público. O app não guarda nada no GitHub: os valores digitados ficam só no celular dela, então o código público não expõe nenhum dado.

## Instalar no celular

O próprio app oferece a instalação, direto da página publicada no GitHub Pages. Basta abrir o endereço no navegador do celular:

- **Android (Chrome) e computador (Chrome/Edge)**: aparece um cartão **“Instale o app no seu celular”** na tela *Registrar*, com o botão **Instalar aplicativo**. O mesmo botão fica em *Ajustes > Instalar no celular*. Um toque e o ícone vai para a tela inicial.
- **iPhone (Safari)**: a Apple não permite um botão de instalar. O app mostra um cartão com o botão **Ver como instalar**, que abre os passos: compartilhar > *Adicionar à Tela de Início* > *Adicionar*.
- Se ela abrir o endereço por um link dentro do WhatsApp, a instalação não funciona nesse navegador interno. Ela deve abrir o link no Safari (iPhone) ou no Chrome (Android) primeiro.
- Depois de instalado, o cartão deixa de aparecer. Se ela tocar em *Agora não*, o aviso volta só depois de 14 dias, e a opção continua em *Ajustes*.

Instalado, o app abre em tela cheia e funciona sem internet. No iPhone isso também é importante para os dados: o Safari pode limpar dados de sites que ficam muitos dias sem uso, mas apps adicionados à tela inicial não sofrem esse limite.

Requisitos para a instalação funcionar: o endereço precisa ser `https` (o GitHub Pages já é) e os arquivos `manifest.webmanifest`, `sw.js` e os ícones precisam ficar na mesma pasta do `index.html`.

## Como funcionam as contas

- Em *Adicionar conta* ela informa o valor, o nome (há atalhos como Aluguel e Luz) e o dia do vencimento, e escolhe se a conta repete **Todo mês** ou vale **Só neste mês**.
- Quando um mês novo começa, as contas marcadas como *Todo mês* aparecem sozinhas, **sem o “paga”**, com o valor do mês anterior. Para uma conta que varia (como a luz), basta tocar nela e ajustar o valor: o novo valor vale para aquele mês e serve de base para o seguinte.
- Meses passados nunca mudam sozinhos. Apagar uma conta no mês atual faz com que ela não volte nos meses seguintes. Em qualquer apagar aparece *Desfazer*.
- Vencimento no dia 31 vale como último dia nos meses mais curtos.
- Contas entram no backup e na restauração, junto com os ganhos. Elas não vão para a planilha (CSV), que traz só os ganhos.

## Sobre os dados

- Ficam salvos apenas no navegador deste aparelho. Trocar de celular, limpar os dados do navegador ou usar outro navegador começa do zero.
- Por isso existe o **backup** (Ajustes). Ele gera um arquivo que pode ser enviado pelo WhatsApp ou e-mail e restaurado depois, inclusive em outro aparelho.
- A restauração **soma** os registros do arquivo aos que já existem, sem duplicar.
- O app lembra de fazer backup quando já há alguns registros e passou mais de 30 dias do último.

## Testar no computador

```
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Atualizar o app

Troque os arquivos no repositório. Como o app funciona offline, ele guarda uma cópia: a mudança aparece na **segunda** vez que for aberto depois da publicação. Se mudar muita coisa, aumente o número em `sw.js` (hoje `meus-ganhos-v3`, troque para `meus-ganhos-v4`) para forçar a atualização.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura da página |
| `styles.css` | Visual (rosa bebê, verde e cores de apoio suaves) |
| `app.js` | Toda a lógica, os cálculos e os gráficos |
| `manifest.webmanifest`, `sw.js` | Instalação na tela inicial e uso offline |
| `icon.svg`, `icon-*.png`, `apple-touch-icon.png` | Ícones |

## Ideias para depois

Quando quiserem sincronizar entre aparelhos ou ter login, o próximo passo natural é um banco online (Supabase ou Firebase). A estrutura dos dados já é simples: cada registro tem `id`, `date`, `cents`, `minutes` e `note`.
