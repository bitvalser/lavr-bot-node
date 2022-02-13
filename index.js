"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IS_PROD = exports.emitter = exports.redis = exports.client = void 0;
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
const events_1 = __importDefault(require("events"));
const package_json_1 = __importDefault(require("../package.json"));
const Discord = __importStar(require("discord.js"));
const redis_1 = require("redis");
const character_controller_1 = require("./controllers/character.controller");
const help_controller_1 = require("./controllers/help.controller");
const level_controller_1 = require("./controllers/level.controller");
const stats_controller_1 = require("./controllers/stats.controller");
const firebase_1 = __importDefault(require("firebase"));
const gifs_controller_1 = require("./controllers/gifs.controller");
const channel_role_constants_1 = require("./constants/channel-role.constants");
const controllers_processor_class_1 = require("./classes/controllers-processor.class");
const when_chapter_conroller_1 = require("./controllers/when-chapter.conroller");
const arts_controller_1 = require("./controllers/arts.controller");
const tests_controller_1 = require("./controllers/tests.controller");
const tests_results_controller_1 = require("./controllers/tests-results.controller");
firebase_1.default.initializeApp({
    apiKey: 'AIzaSyBCwD-z0MAvT2Jk4KxThNAFT4F62wpkA_0',
    authDomain: 'lavr-bot.firebaseapp.com',
    projectId: 'lavr-bot',
    storageBucket: 'lavr-bot.appspot.com',
    messagingSenderId: '89529307402',
    appId: '1:89529307402:web:245f753cc7afe15a62eaf3',
});
if (!process.env.PROD) {
    dotenv.config();
}
exports.client = new Discord.Client({
    // restTimeOffset: 0,
    // shards: 'auto',
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
    partials: ['CHANNEL', 'REACTION', 'MESSAGE'],
});
exports.redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.redis.connect();
exports.emitter = new events_1.default();
exports.IS_PROD = JSON.parse(process.env.PROD || 'false');
const BOT_VERSION = package_json_1.default.version;
const TEST_TOP_GUILD_ID = '699101364512489575';
const TEST_TOP_CHANNEL_ID = '800660959877922816';
const TEST_TOP_MESSAGE_ID = '935554445658435704';
const TEST_TOP_ID = 'dfAZVeolHC0jSNA8drdp';
console.log(`Bot prod -> ${exports.IS_PROD} (${BOT_VERSION})`);
exports.client.login(process.env.BOT_TOKEN);
firebase_1.default
    .auth()
    .signInWithEmailAndPassword('bitvalser@gmail.com', process.env.FIREBASE_PASSWORD || '')
    .then(({ user }) => {
    console.log(`Logged in Firebase as ${user === null || user === void 0 ? void 0 : user.displayName}!`);
});
exports.client.on('ready', () => {
    var _a;
    console.log(`Logged in as ${(_a = exports.client === null || exports.client === void 0 ? void 0 : exports.client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
});
exports.client.on('guildMemberAdd', (member) => {
    const role = member.guild.roles.cache.find((role) => role.id === channel_role_constants_1.ChannelRole.Reader);
    if (role) {
        member.roles.add(role);
    }
});
const rootCommandProcessor = new controllers_processor_class_1.ControllerProcessor([
    character_controller_1.CharacterController,
    gifs_controller_1.GifsController,
    help_controller_1.HelpController,
    level_controller_1.LevelController,
    stats_controller_1.StatsController,
    when_chapter_conroller_1.WhenChapterController,
    arts_controller_1.ArtsController,
    tests_controller_1.TestsController,
    tests_results_controller_1.TestsResultsController,
]);
exports.client.on('message', (message) => {
    console.log(message.content);
    if (message.content.startsWith('!') && !message.author.bot) {
        rootCommandProcessor.processMessage(message);
    }
});
