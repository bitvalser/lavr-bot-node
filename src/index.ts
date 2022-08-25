import 'reflect-metadata';
import * as dotenv from 'dotenv';
import EventEmitter from 'events';
import packageJson from '../package.json';
import * as Discord from 'discord.js';
import { createClient } from 'redis';
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
import { Channels } from './constants/channels.constants';

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
export const redis = createClient({
  url: process.env.REDIS_URL,
});
redis.connect();
export const emitter = new EventEmitter();
export const IS_PROD = JSON.parse(process.env.PROD || 'false');
const BOT_VERSION = packageJson.version;
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
});

client.on('guildMemberAdd', (member) => {
  const channel = member.guild.channels.cache.get(Channels.Start) as Discord.TextChannel;
  if (channel) {
    channel.send(
      `<@${member.id}>, Приветствуем вас на нашем дискорд канале посвящённый книге "Everything will be my way!". Прежде чем начать ознакомтесь пожалуйста с ${member.guild.rulesChannel} сервера чтобы получить доступ к нему.`
    );
  }
});

const ACCEPT_REACTION = '✅';
const ACCEPT_RULES_MESSAGE = '1012347996777746452';

client.on('messageReactionAdd', (reaction, user) => {
  const message = reaction.message;
  const guild = message.guild;
  if (message.id === ACCEPT_RULES_MESSAGE && reaction.emoji.name === ACCEPT_REACTION) {
    const role = guild.roles.cache.find((role) => role.id === ChannelRole.Reader);
    if (role) {
      user
        .fetch()
        .then((fetchedUser) =>
          guild.members.fetch({
            user: fetchedUser,
          })
        )
        .then((member) => {
          if (!member.roles.cache.hasAny(ChannelRole.Reader, ChannelRole.StrongReader)) {
            member.roles.add(role);
          }
        });
    }
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

client.on('messageCreate', (message) => {
  console.log(message.content);
  if (message.content.startsWith('!') && !message.author.bot) {
    rootCommandProcessor.processMessage(message);
  }
});
