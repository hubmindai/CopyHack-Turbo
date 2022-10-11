//
//
// Imports
// ############################################
const request = require('supertest')
const app = require('../../app')
const dbService = require('../../services/database')

//
//
// Methods
// ############################################
describe('user-things endpoints', () => {
  let testID = null

  beforeAll(done => {
    request(app)
      .post('/user/things')
      .set('cookie', process.env.TEST_COOKIE)
      .send({
        name: 'Test Name Editable',
        description: 'Test Description',
        type: 'LITE'
      }).end((error, res) => {
        testID = res.headers.location.split('/')[1]
        if (error) return done(error)
        done()
      })
  })

  it('should get things overview page', async () => {
    const res = await request(app)
      .get('/user/things')
      .set('cookie', process.env.TEST_COOKIE)
    expect(res.statusCode).toEqual(200)
    expect(res.text).toContain('Things')
  })

  it('should get things new page', async () => {
    const res = await request(app)
      .get('/user/things/new')
      .set('cookie', process.env.TEST_COOKIE)
    expect(res.statusCode).toEqual(200)
    expect(res.text).toContain('New')
  })

  it('should create a thing', async () => {
    const res = await request(app)
      .post('/user/things')
      .set('cookie', process.env.TEST_COOKIE)
      .send({
        name: 'Test Name',
        description: 'Test Description',
        type: 'LITE'
      })
    expect(res.statusCode).toEqual(302)
  })

  it('should get a things edit page', async () => {
    const res = await request(app)
      .get(`/user/things/${testID}/edit`)
      .set('cookie', process.env.TEST_COOKIE)
    expect(res.statusCode).toEqual(200)
    expect(res.text).toContain('Edit')
  })

  it('should update a thing', async () => {
    const res = await request(app)
      .put(`/user/things/${testID}`)
      .set('cookie', process.env.TEST_COOKIE)
      .send({
        name: 'Updated Name',
        description: 'Updated Description',
        type: 'STANDARD'
      })
    expect(res.statusCode).toEqual(302)
  })

  it('should delete a thing', async () => {
    const res = await request(app)
      .delete(`/user/things/${testID}`)
      .set('cookie', process.env.TEST_COOKIE)
    expect(res.statusCode).toEqual(302)
  })

  afterAll(done => {
    dbService.instance.destroy()
    done()
  })
})
