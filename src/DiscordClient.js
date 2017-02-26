/**
 * @author Timur Kuzhagaliyev <tim.kuzh@gmail.com>
 * @copyright 2017
 * @license MIT
 */

const DiscordJS = require('discord.js');
const DiscordIO = require('discord.io');

const DISCORD_JS = 'discord.js';
const DISCORD_IO = 'discord.io';

class DiscordMessage {

    /**
     * @param {string} id
     * @param {string} channelId
     * @param {string} authorId
     * @param {string} content
     */
    constructor(id, channelId, authorId, content) {
        this.id = id;
        this.channelId = channelId;
        this.authorId = authorId;
        this.content = content;
    }

}

class DiscordClient {

    /**
     * @param {Object} config
     * @param {DiscordJS.Client|DiscordIO.Client} config.client
     * @param {string} config.token
     */
    constructor(config) {
        let client = config.client;
        if (config.token) {
            client = new DiscordJS.Client();
            client.login(config.token);
        }
        this.type = client instanceof DiscordJS.Client ? DISCORD_JS : DISCORD_IO;
        this.client = client;
    }

    /**
     * @callback messageListener
     * @param {DiscordMessage} message
     */

    /**
     * @param {messageListener} listener
     */
    addMessageListener(listener) {
        if (this.type === DISCORD_JS) {
            this.client.on('message', DiscordClient.processDiscordJSMessage.bind(null, listener));
        } else {
            this.client.on('message', DiscordClient.processDiscordIOMessage.bind(null, listener));
        }
    }

    /**
     * @param {messageListener} listener
     * @param {DiscordJS.Message} message
     */
    static processDiscordJSMessage(listener, message) {
        listener(new DiscordMessage(
            message.id,
            message.channel.id,
            message.author.id,
            message.content
        ));
    }

    /**
     *
     * @param {messageListener} listener
     * @param {string} user
     * @param {string} userID
     * @param {string} channelID
     * @param {string} message
     * @param {Object} event
     */
    static processDiscordIOMessage(listener, user, userID, channelID, message, event) {
        listener(new DiscordMessage(
            event.d.id,
            channelID,
            userID,
            message
        ));
    }

    /**
     * @param {DiscordMessage} message
     * @param {function} done
     */
    deleteMessage(message, done) {
        if (this.type === DISCORD_JS) {
            this.client.channels.get(message.channelId).fetchMessage(message.id).then((message) => {
                message.delete();
                done();
            });
        } else {
            this.client.deleteMessage({
                channelID: message.channelId,
                messageIDs: message.id
            }, done);
        }
    }

    /**
     * @param {string} channelId
     * @param {string} filePath
     * @param {string} fileName
     * @param {string} content
     * @param {function} done
     */
    sendFile(channelId, filePath, fileName, content, done) {
        if (this.type === DISCORD_JS) {
            this.client.channels.get(channelId).sendFile(filePath, fileName, content).then(() => done());
        } else {
            let options = {
                to: channelId,
                file: filePath,
                filename: fileName,
                message: content,
            };
            this.client.uploadFile(options, done);
        }
    }

}

DiscordClient.DiscordMessage = DiscordMessage;

module.exports = DiscordClient;
