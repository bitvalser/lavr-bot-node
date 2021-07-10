import { Message, MessageAttachment } from 'discord.js';

const delaySend = (callback: () => void, delay = 1000) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      callback();
      resolve();
    }, delay);
  });

export const botCharactersScripts: {
  [script: string]: (message: Message) => void;
} = {
  'never-gonna': (message: Message) => {
    message.channel.send('Never gonna give you up');
    const img = new MessageAttachment(
      'https://firebasestorage.googleapis.com/v0/b/lavr-bot.appspot.com/o/1230506facaa50218dbc99797f11f264.jpg?alt=media&token=5b85deff-68dd-419e-8e20-a56f34bf6e3f'
    );
    delaySend(() => message.channel.send('Never gonna let you down'))
      .then(() => delaySend(() => message.channel.send('Never gonna run around and desert you')))
      .then(() => delaySend(() => message.channel.send('Never gonna make you cry')))
      .then(() => delaySend(() => message.channel.send('Never gonna say goodbye')))
      .then(() => delaySend(() => message.channel.send('Never gonna tell a lie and hurt you')))
      .then(() => delaySend(() => message.channel.send('Ты попался на рикролл)))', img)));
  },
  'run-river': (message: Message) => {
    delaySend(() => message.channel.send('Я, в своем познании настолько преисполнился'))
      .then(() =>
        delaySend(() =>
          message.channel.send(
            'Что я как будто бы уже сто триллионов миллиардов лет, проживаю на триллионах и триллионах таких же планет, как эта Земля'
          )
        )
      )
      .then(() => delaySend(() => message.channel.send('Мне этот мир абсолютно понятен, и я здесь ищу только одного')))
      .then(() =>
        delaySend(() =>
          message.channel.send(
            'Покоя, умиротворения и вот этой гармонии, от слияния с бесконечно вечным, от созерцания великого фрактального подобия и от вот этого замечательного всеединства существа, бесконечно вечного'
          )
        )
      )
      .then(() => delaySend(() => message.channel.send('ПОКОЯ Я ИЩУ ПОНИМАЕШЬ?!!!')))
      .then(() => delaySend(() => message.channel.send('Хватит мне писать!!!!')));
  },
};
