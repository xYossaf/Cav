const {
   Listener
} = require('discord-akairo');

module.exports = class MessageUpdateListener extends Listener {
   constructor() {
       super('messageUpdate', {
           emitter: 'client',
           event: 'messageUpdate'
       });
   }

   async exec(oldMessage, newMessage) {
      var settings = this.client.db.get(newMessage.guild.id);
      if(settings.messages.enabled && settings.loggedChannels.includes(newMessage.channel.id) && newMessage.author !== this.client.user) {
       var active = await this.client.db.get('messageRecords');
       var channel = newMessage.guild.channels.cache.get(settings.channelToLog);
  
      if (active[newMessage.id]) {
         var message = newMessage.guild.channels.cache.get(settings.channelToLog).messages.cache.get(active[newMessage.id].loggedID);
         if (!message) return;
  
       let text = message.content.replace(oldMessage, '');
       //let regex = '(https?:\/\/[^\s]+)|(:pencil:)|[:]'
          text = text.replace(/https?:\/\/[^\s]+/gi, '');
          text = text.replace(':pencil:', '')
  
       message.edit(`${text.replace('\n','')}:pencil: ${newMessage.content} ${newMessage.attachments.size !== 0 ? `${newMessage.attachments.map(a => a.url).join('\n')}`: ''}`)
      } else {
      channel.send(`${newMessage.channel} ${settings.messages.lastUser === `${newMessage.channel.id}.${newMessage.author.id}` ? '...' : `\`${newMessage.author.id}\` \`${newMessage.member.nickname ? newMessage.member.nickname:newMessage.author.username}\``} :pencil:: ${newMessage.content}${newMessage.attachments.size !== 0 ? `\n ${newMessage.attachments.map(a => a.url).join('\n')}`: ''}`).then(async (msg) => {
         var buffer = this.client.db.get(newMessage.guild.id,'messages.buffer')
         var length = await buffer.push(msg.id);
         var global = this.client.db.get('global');

         if (length > global.bufferLimit) {
           var oldValue = await buffer.shift();
           var oldMsg = await channel.messages.cache.get(oldValue);
           if (!oldMsg) return;
           oldMsg.delete().catch(O_o => {});
         }
         this.client.db.set(newMessage.guild.id, buffer, 'messages.buffer')
      });
      }
      } 

   }
}