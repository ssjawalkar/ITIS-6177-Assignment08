let express = require('express');
let app = express();
let port = 3000;

const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const cors = require('cors')
const axios = require('axios')
const { body, validationResult } = require('express-validator');

//app.use(express.urlencoded())
app.use(express.json())

const options = {
    swaggerDefinition: {
        info: {
            title: ' Database API',
            version:'1.0.0',
            description: 'Sample Database API autogenerated by Swagger'
        },
        host: '137.184.159.135:3000',
        basePath: '/',
    },
    apis: ['./server.js']
}

const specs = swaggerJsdoc(options)

app.use('/docs',swaggerUi.serve,swaggerUi.setup(specs))
app.use(cors())

const mariadb = require('mariadb');
const pool = mariadb.createPool({
        host : 'localhost',
        user : 'root',
        password: 'root',
        database: 'sample',
        port: 3306,
        connectionLimit:5
});

app.get('/say', (req,res) => {
    axios.get(`https://faas-nyc1-2ef2e6cc.doserverless.co/api/v1/web/fn-f587cd21-ff1a-4f14-8d4d-1d10e8a82c88/default/hello?keyword=${req.query.keyword}`)
    .then(result => {
        res.status(200)
        res.send(result.data)
    })
    .catch(err => {
        res.status(400)
        res.send(err)
    })
});

/**
 * @swagger
 * /customers:
 *    get:
 *      description: Return all customers
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Customer object containing array of all customers
 */

app.get('/customers', function(req,res) {
        pool.query('SELECT * FROM customer')
        .then(data => {
                res.statusCode = 200;
                res.setHeader('Content-Type','Application/json');
                res.json(data);
                })
        .catch(err => console.error('Query error', err.stack));
});

/**
 * @swagger
 * /student:
 *    get:
 *      description: Return all students information
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: get all student data
 */

app.get('/student', function(req,res) {
        pool.query('SELECT * FROM student')
        .then(data => {
                res.statusCode = 200;
                res.setHeader('Content-Type','Application/json');
                res.json(data);
                })
        .catch(err => console.error('Query error', err.stack));
});

/**
 * @swagger
 * /foods:
 *    get:
 *      description: Return all foods
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: get all food data
 */

app.get('/foods', function(req,res) {
        pool.query('SELECT * FROM foods')
        .then(data => {
                res.statusCode = 200;
                res.setHeader('Content-Type','Application/json');
                res.json(data);
                })
        .catch(err => console.error('Query error', err.stack));
});

/**
 * @swagger
 * /agents/{agent_id}:
 *    get:
 *      description: Return information of the agent
 *      produces:
 *          - application/json
  *      parameters:
 *          - name: agent_id
 *            in: path
 *            type: string
 *            example: A012
 *            required: true
 *      responses:
 *          200:
 *              description: Agent object containing agent information
 */

app.get('/agents/:agent_id', function(req,res) {
    pool.query(`SELECT * FROM agents WHERE AGENT_CODE = '${req.params.agent_id}'`)
    .then(data => {
            res.statusCode = 200;
            res.setHeader('Content-Type','Application/json');
            res.json(data);
            })
    .catch(err => console.error('Query error', err.stack));
});

/**
 * @swagger
 * /studentreport/{student_id}:
 *    get:
 *      description: Return student report of roll no 15
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: student_id
 *            in: path
 *            type: integer
 *            format: int64
 *            required: true
 *            example: 15
 *      responses:
 *          200:
 *              description: get student report
 */

app.get('/studentreport/:student_id', function(req,res) {
    pool.query(`SELECT * FROM studentreport WHERE ROLLID = '${req.params.student_id}'`)
    .then(data => {
            res.statusCode = 200;
            res.setHeader('Content-Type','Application/json');
            res.json(data);
        })
    .catch(err => console.error('Query error', err.stack));
});

/**
 * @swagger
 * /company:
 *    post:
 *      description: Add new company
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: Company
 *            in: body
 *            required: true
 *            schema:
 *                $ref: "#/definitions/Company"
 *      responses:
 *          200:
 *              description: Company object containing all companies
 *          400:
 *              description: Incorrect parameters
  *          500:
 *              description: Server Error
 */

 app.post('/company', [body('COMPANY_ID','Company ID is required').not().isEmpty().trim(),
 body('COMPANY_ID').isNumeric().withMessage('Incorrect COMPANY_ID').isLength({max:6}).withMessage("COMPANY_ID can have max 6 chars"),
 body('COMPANY_NAME').isAlpha('en-US',{ignore:' '}).withMessage('Incorrect COMPANY_NAME').isLength({max:25}).withMessage("COMPANY_NAME can have max 25 chars"),
 body('COMPANY_CITY').isAlpha('en-US',{ignore:' '}).withMessage('Incorrect COMPANY_CITY').isLength({max:25}).withMessage("COMPANY_CITY can have max 25 chars")], function(req,res) {
        
        const err = validationResult(req)
        if (!err.isEmpty()) {
                res.statusCode = 400
                res.json({err:err.array()})
                return;
        }

        const {COMPANY_ID,COMPANY_NAME,COMPANY_CITY}=req.body

        pool.query(`INSERT INTO company VALUES ('${COMPANY_ID}', '${COMPANY_NAME}', '${COMPANY_CITY}')`)
        .then(data => {
                res.statusCode = 200;
                res.set('Content-Type','Application/json');
                res.send(data)
                return
                //res.status(200).set('Content-Type','Application/json').send(data);
                })
        .catch(err => console.error('Query error', err.stack));
    });

/**
 * @swagger
 * /foods:
 *    put:
 *      description: Update or Insert the foods
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: Foods
 *            in: body
 *            required: true
 *            schema:
 *                $ref: "#/definitions/putFoods"
 *      responses:
 *          200:
 *              description: Foods object containing all foods
 *          400:
 *              description: Incorrect parameters
 *          500:
 *              description: Server Error
 */

 app.put('/foods', [body('ITEM_ID','ITEM_ID is required').not().isEmpty().trim(),
 body('ITEM_ID').isNumeric().withMessage('Incorrect ITEM_ID').isLength({max:6}).withMessage("ITEM_ID can have max 6 chars"),
 body('ITEM_NAME').isAlpha('en-US',{ignore:' '}).withMessage('Incorrect ITEM_NAME').isLength({max:25}).withMessage("ITEM_NAME can have max 25 chars"),
 body('ITEM_UNIT').isAlpha('en-US',{ignore:' '}).withMessage('Incorrect ITEM_UNIT').isLength({max:5}).withMessage("ITEM_UNIT can have max 5 chars"),
 body('COMPANY_ID').isNumeric().withMessage('Incorrect COMPANY_ID').isLength({max:6}).withMessage("COMPANY_ID can have max 6 chars")], function(req,res) {
        
        const err = validationResult(req)
        if (!err.isEmpty()) {
                res.statusCode = 400
                res.json({err:err.array()})
                return;
        }

        const {ITEM_ID,ITEM_NAME,ITEM_UNIT,COMPANY_ID}=req.body

        pool.query(`SELECT * FROM foods WHERE ITEM_ID = '${ITEM_ID}'`)
        .then(data => {
                if (data.length == 0) {
                        pool.query(`INSERT INTO foods VALUES ('${ITEM_ID}', '${ITEM_NAME}', '${ITEM_UNIT}', '${COMPANY_ID}')`)
                        .then(ans => {
                                res.statusCode = 200;
                                res.set('Content-Type','Application/json');
                                res.send(ans)
                                return
                        })
                        .catch(err => console.error('Query error', err.stack));
                }
                pool.query(`UPDATE foods SET ITEM_NAME = '${ITEM_NAME}', ITEM_UNIT = '${ITEM_UNIT}', COMPANY_ID = '${COMPANY_ID}' WHERE ITEM_ID = '${ITEM_ID}'`)
                .then(ans => {
                        res.statusCode = 200;
                        res.set('Content-Type','Application/json');
                        res.send(ans)
                        return
                })
                .catch(err => console.error('Query error', err.stack));
        })
        .catch(err => console.error('Query error', err.stack));
    });

/**
 * @swagger
 * /foods:
 *    patch:
 *      description: Update the food items
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: Foods
 *            in: body
 *            required: true
 *            schema:
 *                $ref: "#/definitions/patchFoods"
 *      responses:
 *          200:
 *              description: Foods object containing all foods
 *          400:
 *              description: Incorrect parameters
 *          500:
 *              description: Server Error
 */

 app.patch('/foods', [body('ITEM_ID','ITEM_ID is required').not().isEmpty().trim(),
 body('ITEM_ID').isNumeric().withMessage('Incorrect ITEM_ID').isLength({max:6}).withMessage("ITEM_ID can have max 6 chars")], function(req,res) {
        
        const err = validationResult(req)
        if (!err.isEmpty()) {
                res.statusCode = 400
                res.json({err:err.array()})
                return;
        }

        const {ITEM_ID,ITEM_NAME,ITEM_UNIT,COMPANY_ID} = req.body
        var q = ''
        if (ITEM_NAME != undefined) {
                q += "ITEM_NAME = '" + ITEM_NAME + "'"
        }
        if (ITEM_UNIT != undefined) {
                if (q != '') {
                        q += ", ITEM_UNIT = '" + ITEM_UNIT + "'"
                }
                else {
                        q += "ITEM_UNIT = '" + ITEM_UNIT + "'"                        
                }
        }
        if (COMPANY_ID != undefined) {
                if (q != '') {
                        q += ", COMPANY_ID = '" + COMPANY_ID + "'"
                }
                else {
                        q += "COMPANY_ID = '" + COMPANY_ID + "'"                        
                }
        }
        
        if (q == '') {
                res.statusCode = 400
                res.set('Content-Type','Application/json');
                res.send({err:'Enter parameters to update'})
                return;
        }
        pool.query(`SELECT * FROM foods WHERE ITEM_ID = '${ITEM_ID}'`)
        .then(data => {
                if (data.length == 0) {
                        res.statusCode = 400;
                        res.set('Content-Type','Application/json');
                        res.send({err:'Invalid ITEM_ID'})
                        return
                }
                pool.query(`UPDATE foods SET ${q} WHERE ITEM_ID = '${ITEM_ID}'`)
                .then(ans => {
                        res.statusCode = 200;
                        res.set('Content-Type','Application/json');
                        res.send(ans)
                        return
                })
                .catch(err => console.error('Query error', err.stack));
        })
        .catch(err => console.error('Query error', err.stack));
    });

/**
 * @swagger
 * /foods/{item_id}:
 *    delete:
 *      description: Delete the specified food item
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: item_id
 *            in: path
 *            required: true
 *            type: integer
 *            format: int64
 *            example: 14
 *      responses:
 *          200:
 *              description: Foods object deleted
 *          400:
 *              description: Incorrect parameter
 *          500:
 *              description: Server Error
 */

 app.delete('/foods/:item_id', function(req,res) {

        pool.query(`DELETE FROM foods WHERE ITEM_ID = '${req.params.item_id}'`)
        .then(data => {
                if (data.affectedRows == 0) {
                        res.statusCode = 400;
                        res.set('Content-Type','Application/json');
                        res.send({err:'Invalid ITEM_ID'})
                        return
                }
                else {
                        res.statusCode = 200;
                        res.set('Content-Type','Application/json');
                        res.send(data)
                        return
                }
        })
        .catch(err => console.error('Query error', err.stack));
    });

/**
 * @swagger
 * /company/{company_id}:
 *    delete:
 *      description: Delete the specified company
 *      produces:
 *          - application/json
 *      parameters:
 *          - name: company_id
 *            in: path
 *            required: true
 *            type: integer
 *            format: int64
 *            example: 10
 *      responses:
 *          200:
 *              description: Company object deleted
 *          400:
 *              description: Incorrect parameter
 *          500:
 *              description: Server Error
 */

 app.delete('/company/:company_id', function(req,res) {

        pool.query(`DELETE FROM company WHERE COMPANY_ID = '${req.params.company_id}'`)
        .then(data => {
                if (data.affectedRows == 0) {
                        res.statusCode = 400;
                        res.set('Content-Type','Application/json');
                        res.send({err:'Invalid COMPANY_ID'})
                        return
                }
                else {
                        res.statusCode = 200;
                        res.set('Content-Type','Application/json');
                        res.send(data)
                        return
                }
        })
        .catch(err => console.error('Query error', err.stack));
    });

app.listen(port, () => {
    console.log('API running on port',port);
});


/**
 * @swagger
 * definitions:
 *    Company:
 *        type: object
 *        required:
 *            - "COMPANY_ID"
 *        properties:
 *            COMPANY_ID:
 *                type: string
 *                example: 10
 *            COMPANY_NAME:
 *                type: string
 *                example: Google
 *            COMPANY_CITY:
 *                type: string
 *                example: New York
 *    putFoods:
 *        type: object
 *        required:
 *            - "ITEM_ID"
 *            - "ITEM_NAME"
 *            - "ITEM_UNIT"
 *            - "COMPANY_ID"
 *        properties:
 *            ITEM_ID:
 *                type: string
 *                example: 14
 *            ITEM_NAME:
 *                type: string
 *                example: Oreo
 *            ITEM_UNIT:
 *                type: string
 *                example: Pcs
 *            COMPANY_ID:
 *                type: string
 *                example: 15
*    patchFoods:
 *        type: object
 *        required:
 *            - "ITEM_ID"
 *        properties:
 *            ITEM_ID:
 *                type: string
 *                example: 14
 *            ITEM_NAME:
 *                type: string
 *                example: Pebbles
 *            ITEM_UNIT:
 *                type: string
 *                example: Oz
 *            COMPANY_ID:
 *                type: string
 *                example: 20
 */