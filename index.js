require("dotenv").config();
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const IGNORED_ROLE_NAMES = ["*+", "Fraktionsverwaltung", "Mitglieder"];

client.once("ready", () => {
  console.log(`✅ Bot ist online als ${client.user.tag}`);
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  // 10 Sekunden Verzögerung gegen versehentliche Doppelposts
  await new Promise(res => setTimeout(res, 10000));

  const channel = await client.channels.fetch(process.env.CHANNEL_ID);
  if (!channel) return;

  // Höchste alte & neue Rolle (außer ignorierte & @everyone)
  const oldTop = oldMember.roles.cache
    .filter(r => r.name !== "@everyone" && !IGNORED_ROLE_NAMES.includes(r.name))
    .sort((a, b) => b.position - a.position)
    .first();

  const newTop = newMember.roles.cache
    .filter(r => r.name !== "@everyone" && !IGNORED_ROLE_NAMES.includes(r.name))
    .sort((a, b) => b.position - a.position)
    .first();

  if (!oldTop || !newTop || oldTop.id === newTop.id) return;

  const mention = `<@${newMember.id}>`;

  // Uprank
  if (newTop.position > oldTop.position) {
    const embed = new EmbedBuilder()
      .setTitle("🔼 Uprank")
      .setDescription(`${mention} (**${newMember.displayName}**) wurde befördert auf **${newTop.name}**.`)
      .setColor("Green")
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    channel.send({ embeds: [embed] });

  // Downrank
  } else if (newTop.position < oldTop.position) {
    const embed = new EmbedBuilder()
      .setTitle("🔽 Downrank")
      .setDescription(`${mention} (**${newMember.displayName}**) wurde herabgestuft auf **${newTop.name}**.`)
      .setColor("Red")
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
