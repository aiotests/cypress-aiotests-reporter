describe('empty spec ', () => {
  it('case which is simply simple : NVTES-TC-4', () => {
    cy.visit('https://example.cypress.io')
  })

  beforeEach(() => {
    cy.visit('https://example.cypress.io/todo')
    cy.log("Starting it " + Cypress.currentTest.title );
  })

  it('NVTES-TC-5, NVTES-TC-6 : displays two todo items by default', () => {
    cy.get('.todo-list li').should('have.length', 2)
    cy.get('.todo-list li').first().should('have.text', 'Pay electric bills')
    cy.get('.todo-list li').last().should('have.text', 'Walk the dog')
    cy.get('.todo-list li').last().should('have.text', 'Walk the dog')
  })
})
