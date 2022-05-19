const Discord = require('discord.js'), config = require('./config.js');
if (!config) throw Error('Config file not found!');

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES']
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag} (${client.user.id})`));

// The special sauce.
const modalObject = {
  title: 'My Cool Modal by DanPlayz0',
  custom_id: 'cool_modal',
  components: [
    {
      type: 1,
      components: [
        {
          type: 4,
          style: 1,
          custom_id: 'text_field_s1',
          label: 'Text Field Style 1',
          placeholder: 'This is a placeholder value.'
        }
      ]
    },
    {
      type: 1,
      components: [
        {
          type: 4,
          style: 2,
          custom_id: 'text_field_s2',
          label: 'Text Field Style 2',
          placeholder: 'This is a placeholder value.'
        }
      ]
    },
  ]
}
const antiPing = (text) => text.replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`);
const truncate = (length, text) => antiPing(text.slice(0, length) + (text.length > length ? '...' : ''));

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;
  const command = message.content.slice(config.prefix.length).split(/ +/)[0]?.toLowerCase()

  console.log(`${message.author.tag} (${message.author.id}) ran command ${command}`);

  if (command === 'help') {
    return message.channel.send({ content: `Use \`${config.prefix}preview\` to preview a modal and use \`${config.prefix}source\` for the source code.`, allowedMentions: { parse: [] } });
  } else if (command === 'preview') {
    const buttonOpenMsg = await message.channel.send({
      content: 'This example made by DanPlayz0 on GitHub.\nFind the source code at <https://github.com/DanPlayz0/DJS-Modals>',
      components: [
        {
          type: 1, components: [
            { type: 2, style: 3, custom_id: 'modal_open', label: 'Press for modal' }
          ]
        }
      ]
    });

    const openCollector = buttonOpenMsg.createMessageComponentCollector({ componentType: 'BUTTON', time: 60 * 1000 });

    openCollector.on('collect', (interaction) => {
      interaction.showModal(modalObject);
      interaction.awaitModalSubmit({ filter: (mInter) => mInter.customId === modalObject.custom_id, time: 5 * 10 * 1000 })
        .then((modalInteraction) => modalInteraction.reply({
          embeds: [
            new Discord.MessageEmbed()
              .setColor('GREEN')
              .setTitle('Modal Response')
              .setDescription(`This was an example modal made by DanPlayz#7757 (<@209796601357533184>).\nFind the source code at <https://github.com/DanPlayz0/DJS-Modals>`)
              .addField('Style 1 (SHORT)', '\`\`\`' + truncate(1010, modalInteraction.components[0].components[0].value) + '\`\`\`')
              .addField('Style 2 (PARAGRAPH)', '\`\`\`' + truncate(1010, modalInteraction.components[1].components[0].value) + '\`\`\`')
          ],
          ephemeral: true
        }));
    });

    openCollector.on('end', () => {
      buttonOpenMsg.edit({
        components: [
          {
            type: 1, components: [
              { type: 2, style: 3, custom_id: 'modal_open', label: 'Press for modal', disabled: true }
            ]
          }
        ]
      })
    })

  } else if (command === 'source') {
    return message.channel.send({ content: "The source code for this bot can be found at https://github.com/DanPlayz0/DJS-Modals" })
  }
});

client.login(config.token);