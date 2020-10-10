// Layer that stands between DB, SOCKET MIDDLEWARE and INTERNAL DISPATCHER (STORE)


const UserDbo = require('../dbo/user');
const AvatarDbo = require('../dbo/avatar');
const UserConstants = require('../constants/User');

const DispatcherEvents = require('../constants/DispatcherEvents');
const dispatcher = require("../dispatcher");
const SocketEvents = require("../constants/SocketEvents");

const Errors = require("../constants/errors");
const { generate: generateGuid } = require("../helpers/guid")
const sharp = require('sharp');
const CDN_FOLDER = require('../constants/Environment');

const fs = require("fs")
const CryptoJS = require("crypto-js");
const db = require('../db');



const uploadAvatar = async ({ base64, userId }) => { /// Type of Bufer




    try {



        // Check how much time left before the User can update his image

        const timestamp = UserDbo.getLastAvatarUpdate(userId);

        if (timestamp && parseInt(Date.now() / 1000) < (timestamp + UserConstants.DELAY_BETWEEN_AVATAR_UPDATE)) {
            throw Errors.ERR_WAIT_BEFORE_UPDATING_AVATAR;
        }



        const md5 = CryptoJS.MD5(base64).toString();
        // Get MD5 to check if the avatar is already in our DB




        let avatar = await AvatarDbo.getByMD5(md5);
        if (avatar) {
            // No need to upload it. Just re-assing an al ready saved one lol
            await UserDbo.setAvatar({ userId, avatarUUID: avatar.UUID });
        }

        else {

            // Create a subset of different sizes (32,64,128)
            const sizes = [32, 64, 128];
            const prototypeImage = sharp(Buffer.from(base64, 'base64')).png();
            const avatar = {
                UUID: generateGuid(),
                sizes: {}
            } // Avatar UUID associated with all sizes. Each avatarId is an auto increment and represent a single avatar size.
            const saveAvatarToDisk = async (size) => {
                // Save to disk each size
                let fileName = `/avatars/${avatar.UUID}-${size}.png`;
                const writeFilePath = `${CDN_FOLDER}${fileName}`;

                await prototypeImage
                    .resize(size, size)
                    .toFile(writeFilePath);

                // Then, Save to database
                let avatarId = await AvatarDbo.insertAvatar({ userId, md5, UUID: avatar.UUID, fileName, size });

                avatar.sizes[size] = fileName;
            };

            const insertedIds = await Promise.all(sizes.map(saveAvatarToDisk)); // We don't really need insertedIds, but it's here in any case.

            await UserDbo.setAvatar({ userId, avatarUUID: avatar.UUID }); // We pass the UUID, because avatarId - as said above - represents the single size avatar file (say 32x32), while UUID is the grouping.



        }

        // Notify internal socket dispatcher
        dispatcher.dispatch({
            event: DispatcherEvents.SESSION_USER_AVATAR_CHANGED,
            data: {
                userId,
                avatar
            }
        });

    }
    catch (e) {
        //fs.unlink(fullPath);
        console.log(e);
        if (!(e in Errors)) {
            e = Errors.ERR_INVALID_PICTURE;
        }
        throw e;
    }



}

const authenticateUser = async ({ sessionId, authenticationToken }) => {
    let user = await UserDbo.getUserByToken(authenticationToken);

    if (user && user.id) {
        // Internal dispatcher to notify user/session store
        dispatcher.dispatch({
            event: DispatcherEvents.SESSION_USER_AUTHENTICATED,
            sessionId,
            data: { user }
        });
        return user;
    }
    return false;

}


module.exports = { authenticateUser, uploadAvatar };