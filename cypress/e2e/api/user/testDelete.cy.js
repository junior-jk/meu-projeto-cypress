import { faker } from '@faker-js/faker';

describe('Criar, logar, verificar e deletar um usuario', () => {
    let userIdUsuario;
    let token;
    let emailUsuario;
    let passwordUsuario;

    beforeEach(() => {
    });
    const userData = {
        nome: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        administrador: 'true'
    };
    it('POST - Cadastrar um novo usuário', () => {
        cy.api({
            method: 'POST',
            url: '/usuarios',
            body: userData
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            expect(response.body._id).to.be.exist;
        
            userIdUsuario = response.body._id;
            emailUsuario = userData.email;
            passwordUsuario = userData.password;

            cy.log(`Usuario criado: ${emailUsuario} - ID: ${userIdUsuario}`);


            // 🔹 Fazer login com o usuario criado
        cy.api({
            method: 'POST',
            url: '/login',
            body: { email: emailUsuario, 
                password: passwordUsuario
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('authorization');

            token = response.body.authorization;

            // 🔹 Verificar se o usuario foi criado com o GET
        cy.api({
                method: 'GET',
                url: `/usuarios/${userIdUsuario}`,
                headers: { 
                    Authorization: token 
                }
            }).then((response) => {
                expect(response.status).to.eq(200); // Usuario deve ser encontrado
                cy.log(`Usuário encontrado com ID: ${userIdUsuario}`);
            });

            // 🔹 Deletar o usuário
        cy.api({
                method: 'DELETE',
                url: `/usuarios/${userIdUsuario}`,
                headers: { 
                    Authorization: token 
                }
            });
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.message).to.eq('Registro excluído com sucesso');
            cy.log(`Usuário deletado: ID ${userIdUsuario}`);
        });
    });
});
});
