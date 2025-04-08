import { faker } from '@faker-js/faker';


describe('Cadastrar um novo usuário', () => {
    let emailDuplicado;

    const usuario = {
        nome: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        administrador: 'true'
    };

    emailDuplicado = usuario.email;
    it('POST - Cadastrar um novo usuário', () => {
        cy.api({
            method: 'POST',
            url: '/usuarios',
            body: usuario,
        }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property('message', 'Cadastro realizado com sucesso');
            expect(response.body._id).to.be.exist;
        });
    });


    it('POST - Cadastrar um novo usuário com email já existente', () => {
        const usuarioEmailDuplicado = {
            nome: faker.name.firstName(),
            email: emailDuplicado,
            password: faker.internet.password(),
            administrador: 'true'
        };
        
        cy.api({
            method: 'POST',
            url: '/usuarios',
            failOnStatusCode: false,
            body: usuarioEmailDuplicado
        }).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body.message).to.eq('Este email já está sendo usado');            
        });
    });
});



