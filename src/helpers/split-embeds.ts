import * as Discord from 'discord.js';

const arrayСhunks = (array, chunkSize) =>
  Array(Math.ceil(array.length / chunkSize))
    .fill(null)
    .map((_, index) => index * chunkSize)
    .map((begin) => array.slice(begin, begin + chunkSize));

export const splitEmbedsChunks = (fields, fieldsChunks = 10, chunks = 5) => {
  return arrayСhunks(
    arrayСhunks(fields, fieldsChunks).map((data) => new Discord.MessageEmbed().addFields(data)),
    chunks
  );
};
