# back-cab - Backend Cab App

### Objetivo
Implementar o backend de um aplicativo de smartphone que mostra um mapa com 
os taxistas ativos da 99Taxis. O sistema deve assumir que tem diversos taxistas 
cadastrados e permitir atualizar o status desses taxistas, consultar status deles e 
encontrar taxistas em uma dada área. Toda comunicação deve ser feita com 
JSON.

### Premissas
- **NodeJS 4.2.1**: Escolhi node por ser rápido de desenvolver, possuir bom tempo de resposta e utilizar poucos recursos da máquina. Não escolhi a versão 5 pois ela tem menor tempo de garantia de suporte (estamos falando de ambientes produtivos aqui, certo?).
- **Postegres**: A escolha de Postegres foi uma surpresa para mim mesmo. Eu queria utilizar uma base de dados simples que permitisse indices para busca de latitude e longitude. Descartei o MongoDB prontamente quando percebi que o nível de escritas dessa aplicação seria muito alto (50%, talvez...). Ninguém iria gostar de uma aplicação travada por locks consecutivos na coleção. Pensei em cassandra, mas me deparei com matérias interessantes sobre performances em bancos de dados relacionais, algumas vezes batendo propostas NoSQL que em teoria teriam melhor desempenho. Então escolhi Postegres (será q alguém ainda usa MySQL num projeto novo?). Como a característica dessa base é muito simples (mesmo em relacionais exigiria apenas uma tabela), criei um modelo utilizando um id sequencial e 2 indices (um pela placa e outro pela localização).
- **Heroku**: Utilizei heroku para subir o serviço na nuvem. Aqui não tenho muito a dizer (detalhes mais abaixo), exceto que estou utilizando o plano free que indica indisponibilidade mínima de 6 hrs por dia (como não me apronfundei muito nisso, se por acaso o serviço estiver fora quando forem testar, tentem novamente mais tarde... rs)
- **Serviços extras**: Tomei a liberdade de criar um serviço que retorna os dados do motorista através da placa, pois nos requisitos não havia uma forma de obter o driverId quando se cadastrava o motorista.
- **Autenticação**: Usei basicAuth pois estava com tempo reduzido para implementar Passport (Quando implementei num projeto meu, levei uns 3 dias para fazer tudo funcionar). Num ambiente seguro (máquina cliente conectando na máquina de back em rede interna) o basicAuth é suficiente. Porém como o BackCab será aberto, acho melhor utilizar OpenID (se não for necessário se preocupar com autorização) ou OAuth 2.0. Para ambas abordagens eu escolheria utilizar [Passport](https://www.npmjs.com/package/passport).

### Arquitetura do Projeto
O projeto possui a seguinte estrutura:
- **/config**: Local onde ficam as configurações da aplicação. Utilizo convenção sobre configuração baseada em ambiente. O arquivo `default.js` possui a configuração principal da aplicação e tudo o que é comum a todos os ambientes. Já os arquivos `development.js` e  `production.js` possuem as configurações específicas dos ambientes de desenvolvimento e produção, respectivamente. Estes últimos arquivos sobreescrevem as configurações do `default.js`. Variáveis de ambiente _SEMPRE_ sobrescrevem a configuração desses arquivos.
- **/lib**: Local onde ficam os scripts auxiliares e agrupamentos de funcionalidades.
- **/lib/persistence**: Possui a estrutura relacionada ao banco de dados. Criei o arquivo `db.js` para servir como abstração da implementação do banco de dados, assim podemos substituir os bancos de dados apenas mudando para quem o `db.js` aponta. Nesse projeto há uma implementação de banco de dados em postegres (com script SQL) e uma em memória (utilizada para testes unitários).
- **/rest**: Local onde fica a estrutura REST da aplicação. O arquivo `server.js` é o servidor restify em si; Já o arquivo `rest-service.js` é uma abstração das funcionalidades padrões para todos os serviços REST; O arquivo `cab-driver-rest.js` implementa essa abstração, tornando-o bem mais simples e organizado de implementar); O arquivo `clustered-server.js` coloca o `server.js` num ambiente clusterizado do NodeJS (subindo uma instância por core virtual da máquina). Essa abordagem é importante e recomendada para servidores backend, pois tudo que roda na V8 é singlethread.
- **/tests/integration**: Local onde ficam os testes de integração do projeto (conexões externas de qualquer natureza - Base de dados, APIs de terceiros, LDAP, etc). Não implementei nenhum nesse projeto :(
- **/tests/unit**: Local onde ficam os testes unitários da aplicação.

### Ambiente de desenvolvimento
Para montar o ambiente, siga os passos abaixo:
- Instale o postgres local (estou utilizando o 8.9)
- Conecte-se no postgres e crie uma base chamada `backcab`
- Execute o script `/lib/persistence/postegres.sql` na base `backcab`
- Instale o nvm
- Instale a versão 4.2.X do node via nvm
- Rode `node -v` e verifique se é a versão correta do nodejs, se não for, execute `nvm use v4.2` e teste novamente
- Baixe esse projeto via git clone
- Entre na raiz do diretório do projeto
- Rode `npm install` e aguarde a instalação de dependências
- Rode `npm test` para verificar se está tudo em ordem
- Rode `npm start` para subir o servidor local. Subirá um servidor por core. Para subir apenas uma instância, utilize variável de ambiente: `NODE_ENV=production npm start`


### Projeto em execução na nuvem:

[BackCab via Heroku](http://back-cab.herokuapp.com/)

**create**

```curl -iH "Content-Type: application/json" -X POST -d '{"name":"Pedro","carPlate":"RPC9999"}' http://admin:admin@back-cab.herokuapp.com/drivers```

**updateStatus**

```curl -iH "Content-Type: application/json" -X POST -d '{"latitude":-23.60810717,"longitude":-46.67500346,"driverId":5997,"driverAvailable":true}' http://admin:admin@back-cab.herokuapp.com/drivers/8475/status```

**inArea**

```curl -iH "Content-Type: application/json" 'http://admin:admin@back-cab.herokuapp.com/drivers/inArea?sw=-23.612474,-46.702746&ne=-23.589548,-46.673392'```

**getStatus**

```curl -iH "Content-Type: application/json"  http://admin:admin@back-cab.herokuapp.com/drivers/8475/status```

**getStatusByCarPlate**

```curl -iH "Content-Type: application/json"  http://admin:admin@back-cab.herokuapp.com/drivers/carPlate/asd0000/status```
