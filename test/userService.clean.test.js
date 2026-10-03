const { UserService } = require('../src/userService');

const dadosUsuarioPadrao = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25
};

describe('UserService - Suíte de Testes Limpos', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('cria um usuário ativo com identificador gerado', () => {
    const usuarioCriado = userService.createUser(
      dadosUsuarioPadrao.nome,
      dadosUsuarioPadrao.email,
      dadosUsuarioPadrao.idade
    );

    expect(usuarioCriado).toMatchObject({
      nome: dadosUsuarioPadrao.nome,
      email: dadosUsuarioPadrao.email,
      idade: dadosUsuarioPadrao.idade,
      isAdmin: false,
      status: 'ativo'
    });
    expect(usuarioCriado.id).toEqual(expect.any(String));
    expect(usuarioCriado.createdAt).toBeInstanceOf(Date);
  });

  test('cria um usuário com exatamente 18 anos', () => {
    const usuarioCriado = userService.createUser('Limite', 'limite@teste.com', 18);

    expect(usuarioCriado.idade).toBe(18);
  });

  test('cria um usuário administrador quando isAdmin é informado', () => {
    const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

    expect(usuarioAdmin.isAdmin).toBe(true);
  });

  test('busca um usuário existente pelo identificador', () => {
    const usuarioCriado = userService.createUser(
      dadosUsuarioPadrao.nome,
      dadosUsuarioPadrao.email,
      dadosUsuarioPadrao.idade
    );

    const usuarioBuscado = userService.getUserById(usuarioCriado.id);

    expect(usuarioBuscado).toBe(usuarioCriado);
  });

  test('retorna null ao buscar um usuário inexistente', () => {
    const usuarioBuscado = userService.getUserById('id-inexistente');

    expect(usuarioBuscado).toBeNull();
  });

  test('desativa um usuário comum', () => {
    const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

    const resultado = userService.deactivateUser(usuarioComum.id);

    expect(resultado).toBe(true);
    expect(userService.getUserById(usuarioComum.id)).toMatchObject({
      status: 'inativo'
    });
  });

  test('mantém um usuário administrador ativo ao tentar desativá-lo', () => {
    const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

    const resultado = userService.deactivateUser(usuarioAdmin.id);

    expect(resultado).toBe(false);
    expect(userService.getUserById(usuarioAdmin.id)).toMatchObject({
      status: 'ativo',
      isAdmin: true
    });
  });

  test('retorna false ao tentar desativar um usuário inexistente', () => {
    const resultado = userService.deactivateUser('id-inexistente');

    expect(resultado).toBe(false);
  });

  test('gera um relatório com cabeçalho e usuários cadastrados', () => {
    userService.createUser('Alice', 'alice@email.com', 28);
    userService.createUser('Bob', 'bob@email.com', 32);

    const relatorio = userService.generateUserReport();

    expect(relatorio).toContain('Relatório de Usuários');
    expect(relatorio).toContain('Alice');
    expect(relatorio).toContain('Bob');
  });

  test('exibe o status inativo no relatório para usuário desativado', () => {
    const usuario = userService.createUser('Carol', 'carol@email.com', 35);
    userService.deactivateUser(usuario.id);

    const relatorio = userService.generateUserReport();

    expect(relatorio).toContain('Status: inativo');
  });

  test('gera um relatório informando ausência de usuários', () => {
    const relatorio = userService.generateUserReport();

    expect(relatorio).toContain('Nenhum usuário cadastrado.');
  });

  test('lança erro ao tentar criar usuário menor de idade', () => {
    const criarUsuarioMenorDeIdade = () => {
      userService.createUser('Menor', 'menor@email.com', 17);
    };

    expect(criarUsuarioMenorDeIdade).toThrow('O usuário deve ser maior de idade.');
  });

  test.each([
    ['nome', '', 'semnome@email.com', 25],
    ['email', 'Sem Email', '', 25],
    ['idade', 'Sem Idade', 'semidade@email.com', undefined]
  ])('lança erro ao tentar criar usuário sem %s', (_campo, nome, email, idade) => {
    const criarUsuarioIncompleto = () => {
      userService.createUser(nome, email, idade);
    };

    expect(criarUsuarioIncompleto).toThrow('Nome, email e idade são obrigatórios.');
  });
});
