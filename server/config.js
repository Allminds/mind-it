ServiceConfiguration.configurations.remove({
  service: "google"
});
ServiceConfiguration.configurations.insert({
  service: process.env.service ,
  clientId: process.env.clientId,
  secret: process.env.secret
});
