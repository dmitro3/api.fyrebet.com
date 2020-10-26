const { Validator } = require('node-input-validator'); // Input validation



const userActions = require("../actions/session");
const UserDbo = require("../dbo/user");

const Errors = require("../constants/errors");

const sharp = require('sharp');

const validate = require('../helpers/validate');
const handlers = [
    ['post', "/update-avatar", async (req, res) => {


        let authenticationToken = undefined;
        let user = undefined;
        if (!('x-authentication-token' in req.headers) || !(authenticationToken = req.headers['x-authentication-token']) || !(user = await UserDbo.getUserByToken(authenticationToken))) {
            return res.send({
                success: false,
                error: Errors.ERR_UNAUTHENTICATED
            }).status(404);

        }
        try {

            const base64 = req.body.b64;

            await userActions.uploadAvatar({
                userId: user.id,
                base64
            });
        }
        catch (Err) {

            return res.send({
                success: false,
                error: Err
            });

        }

        res.send({ success: true });
    }],
    ['post', "/authenticate", async (req, res) => {

        debug && console.log('/authenticate | Validating user credentials');
        const v = new Validator(
            req.body,
            {
                email: 'required|email',
                password: 'required|minLength:6|maxLength:32'
            }
        )

        if (!await v.check()) {
            res.status(400).send(v.errors);
            return;
        }
        let email = req.body.email;
        let password = req.body.password;

        if (email && password) {
            debug && console.log('/authenticate | Checking if is registered');
            let isRegistered = await User.emailExists(email);
            if (isRegistered) { // It's a login
                debug && console.log('/authenticate | Is Registered');
                let authentication_token = await User.getAuthenticationToken(email, password);
                console.log('Auth token,', authentication_token)
                if (authentication_token) {
                    //res.cookie('authentication_token', authentication_token, { maxAge: 900000, httpOnly: false });
                    res.status(302).send({
                        loggedIn: true, authentication_token
                    });
                }
                else {
                    res.status(404).send({
                        "loggedIn": false,
                        "error": "Username or password is wrong."
                    })
                }
            }
            else {
                // Register
                debug && console.log('/authenticate | Is Not Registered');
                let { authentication_token, userId } = await User.createUser({ email, password });


                res.cookie('authentication_token', authentication_token, { maxAge: 900000, httpOnly: true });

                res.send({
                    loggedIn: true,
                    userId
                });

            }

        }
        else {
            console.log('NOT email and password isset');
        }
        //res.status(400).send(false);
    }],
    ['get', '/user-brief', async (req, res) => {
        let userUUID = req.query.userUUID;
        if (!userUUID) {
            return res.send({
                error: Errors.ERR_UNKNOWN
            });
        }
        let userBrief = await UserDbo.getUserBrief(userUUID);
        if (!userBrief) {
            return res.send({
                error: Errors.ERR_UNKNOWN
            });
        }
        return res.send(userBrief);
    }],
    ['get', '/all-users', async (req, res) => {
        res.send(await UserDbo.getAllUsers());
    }],
    ['get', '/userAutocomplete', async (req, res) => {
        // Validate. No weird characters, no sql injections, no bullshit.
        const inputQuery = req.query.query;
        console.log(inputQuery)
        if ( !validate.usernameAutocomplete(inputQuery)){
            console.log('FAIL')
            return res.send([]);
        }
        return res.send(await UserDbo.getForAutocomplete(inputQuery));
    }]

    //,
    // ['post', '/update-avatar', async (req, res) => {
    //     const authenticationToken = (req.headers('authentication_token'));
    //     const userId = undefined;
    //     if (!authenticationToken || !(userId = UserDbo.getUserIdByAuthToken(authenticationToken))) {
    //         res.send({
    //             success: false,
    //             error: Errors.ERR_UNAUTHENTICATED
    //         });
    //     }

    //     const b64 = req.params.base64;

    //     try {
    //         const imageBuffer = Buffer.from(b64, 'base64');
    //         userActions.updateAvatar({
    //             imageBuffer,
    //             userId
    //         })
    //     }
    //     catch (e) {
    //         res.send({
    //             success: false,
    //             error: e
    //         });
    //     }

    // }]
]


module.exports = handlers;