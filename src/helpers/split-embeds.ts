import * as Discord from 'discord.js';

const arrayСhunks = (array, chunkSize) =>
  Array(Math.ceil(array.length / chunkSize))
    .fill(null)
    .map((_, index) => index * chunkSize)
    .map((begin) => array.slice(begin, begin + chunkSize));

export const splitEmbedsChunks = (fields) => {
  return arrayСhunks(
    arrayСhunks(fields, 10).map((data) => new Discord.MessageEmbed().addFields(data)),
    5
  );
};
