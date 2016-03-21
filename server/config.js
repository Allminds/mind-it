ServiceConfiguration.configurations.remove({
  service: "google"
});
ServiceConfiguration.configurations.insert({
   service: "google",
   clientId: process.env.clientId,
   secret: process.env.secret
});
