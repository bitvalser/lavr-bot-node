import * as dotenv from 'dotenv';
dotenv.config();
import * as Discord from 'discord.js';
import { REST } from '@discordjs/rest';
import { CharacterController } from './controllers/character.controller';
import { HelpController } from './controllers/help.controller';
import { LevelController } from './controllers/level.controller';
import { StatsController } from './controllers/stats.controller';
import firebase from 'firebase';
import { CronJob } from 'cron';
import { GifsController } from './controllers/gifs.controller';
import { getBotChapterNumber } from './services/additional.service';
import { botChapters } from './data/bot-chapters.data';
import { botCharactersScripts } from './data/characters-scripts';
import { GameController } from './controllers/game.controller';
import './express/server';

firebase.initializeApp({
  apiKey: 'AIzaSyBCwD-z0MAvT2Jk4KxThNAFT4F62wpkA_0',
  authDomain: 'lavr-bot.firebaseapp.com',
  projectId: 'lavr-bot',
  storageBucket: 'lavr-bot.appspot.com',
  messagingSenderId: '89529307402',
  appId: '1:89529307402:web:245f753cc7afe15a62eaf3',
});

export const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ['CHANNEL', 'REACTION', 'MESSAGE'],
});
export const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);
export const IS_PROD = JSON.parse(process.env.PROD || 'false');
client.login(process.env.BOT_TOKEN);
console.log(`Bot prod -> ${IS_PROD}`);
firebase
  .auth()
  .signInWithEmailAndPassword('bitvalser@gmail.com', process.env.FIREBASE_PASSWORD || '')
  .then(({ user }) => {
    console.log(`Logged in Firebase as ${user?.displayName}!`);
  });

const CHANNEL_WHITELIST = ['800660959877922816'];
const CHANNEL_TO_CLEAN = ['700647307997216828', '699117028841357382', '768073525420228648'];
const GUILD_ID = '699101364512489575';
const DEV_USER_ID = '318031558357286913';

const clearMessagesJob = () =>
  new CronJob({
    cronTime: '0 0 0 * * *',
    onTick: () => {
      console.log(`[${new Date().toISOString()}] clear messages`);
      CHANNEL_TO_CLEAN.map((id) =>
        client.channels
          .fetch(id)
          .then((channel) => channel as Discord.TextChannel)
          .then((channel) =>
            channel.messages
              .fetch({ limit: 10 })
              .then((messages) => messages.filter((message) => message.attachments.size === 0))
              .then((messages) => messages.map((message) => message.delete()))
          )
      );
    },
    start: true,
    runOnInit: true,
  });

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);

  // clearMessagesJob();
});

client.on('guildMemberAdd', (member) => {
  // const channel = member.guild.channels.cache.find((ch) => ch.name === 'member-log');
  const role = member.guild.roles.cache.find((role) => role.id === '699103492190765136');

  if (role) {
    member.roles.add(role);
  }
});

client.on('messageCreate', (message) => {
  console.log(message.content);
  if (!IS_PROD && message.author.id !== DEV_USER_ID) {
    return;
  }
  if (message.author.bot) {
    return;
  }
  if (message.content.startsWith('!')) {
    const commandName = message.content.substr(1).split(' ')[0];
    const args = message.content.replace(/\s+/g, ' ').split(' ').slice(1);
    if (CHANNEL_WHITELIST.includes(message.channel.id) || !message.guild) {
      switch (commandName) {
        case 'персонаж':
          new CharacterController(message, args).processMessage();
          break;
        case 'помощь':
          new HelpController(message, args).processMessage();
          break;
        case 'статистика':
          new StatsController(message, args).processMessage();
          break;
        case 'уровень':
          new LevelController(message, args).processMessage();
          break;
        case 'игра':
          new GameController(message, args).processMessage();
          break;
        case 'gif':
        case 'гиф':
          new GifsController(message, args).processMessage();
          break;
        case 'когда_глава':
          if (!message.guild) return;
          const gif = new Discord.MessageAttachment(
            'https://firebasestorage.googleapis.com/v0/b/lavr-bot.appspot.com/o/DMCW.gif?alt=media&token=23088aa7-f953-4588-a24e-36eee2f2a374'
          );
          message.channel.sendTyping();
          getBotChapterNumber().then((count) => {
            if (count >= botChapters.length) {
              message.reply({
                content: 'Когда автор сделает и редактор проверит :D',
                embeds: [gif],
              });
            } else {
              const { answer, mainMessage, runScript } = botChapters[count];
              message.reply({
                content: mainMessage || 'Когда автор сделает и редактор проверит :D',
                embeds: [gif],
              });
              if (answer) {
                message.channel.send(answer);
              }
              if (runScript) {
                botCharactersScripts[runScript](message);
              }
            }
          });
          break;
        default:
          message.reply('Неизвестная комманда');
      }
      return;
    }
    switch (commandName) {
      case 'gif':
      case 'гиф':
        new GifsController(message, args).processMessage();
        break;
    }
  }
});
