import 'reflect-metadata';
import * as dotenv from 'dotenv';
import packageJson from '../package.json';
import * as Discord from 'discord.js';
import { CharacterController } from './controllers/character.controller';
import { HelpController } from './controllers/help.controller';
import { LevelController } from './controllers/level.controller';
import { StatsController } from './controllers/stats.controller';
import firebase from 'firebase';
import { GifsController } from './controllers/gifs.controller';
import { ChannelRole } from './constants/channel-role.constants';
import { ControllerProcessor } from './classes/controllers-processor.class';
import { WhenChapterController } from './controllers/when-chapter.conroller';
import { ArtsController } from './controllers/arts.controller';
import { TestsController } from './controllers/tests.controller';
import { TestsResultsController } from './controllers/tests-results.controller';

firebase.initializeApp({
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

export const client = new Discord.Client({
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
export const IS_PROD = JSON.parse(process.env.PROD || 'false');
const BOT_VERSION = packageJson.version;
const TEST_TOP_GUILD_ID = '757297356394987581';
const TEST_TOP_CHANNEL_ID = '836613708146671666';
const TEST_TOP_MESSAGE_ID = '934536578334883971';
const TEST_TOP_ID = 't4JAPIM64aPbOtgukEIK';
console.log(`Bot prod -> ${IS_PROD} (${BOT_VERSION})`);
client.login(process.env.BOT_TOKEN);
firebase
  .auth()
  .signInWithEmailAndPassword('bitvalser@gmail.com', process.env.FIREBASE_PASSWORD || '')
  .then(({ user }) => {
    console.log(`Logged in Firebase as ${user?.displayName}!`);
  });

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
  client.guilds
    .fetch(TEST_TOP_GUILD_ID)
    .then((guild) => guild.channels.fetch(TEST_TOP_CHANNEL_ID))
    .then((channel) => (channel as Discord.TextChannel).messages.fetch(TEST_TOP_MESSAGE_ID))
    .then((message) => {
      TestsResultsController.handleRefreshRating(message, TEST_TOP_ID);
    });
});

client.on('guildMemberAdd', (member) => {
  const role = member.guild.roles.cache.find((role) => role.id === ChannelRole.Reader);
  if (role) {
    member.roles.add(role);
  }
});

const rootCommandProcessor = new ControllerProcessor([
  CharacterController,
  GifsController,
  HelpController,
  LevelController,
  StatsController,
  WhenChapterController,
  ArtsController,
  TestsController,
  TestsResultsController,
]);

client.on('message', (message) => {
  console.log(message.content);
  if (message.content.startsWith('!') && !message.author.bot) {
    rootCommandProcessor.processMessage(message);
  }
});
