module.exports = `/*
*  This rule been automatically generated by the auth0-box-platform extension on <%= updateTime() %>
*/
function(user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  if (!user.app_metadata.box_appuser_id) {
    var options = {
      headers: {
        'x-api-key': '<%= apiKey %>'
      },
      url: '<%= extensionUrl %>/api/provision',
      json: {
        user: user
      }
    };

    console.log('Creating a new Box App User...');
    request.post(options, function(err, res, body) {
      if (err) {
        console.log('Error creating Box App User:', err);
        return callback(err);
      }

      if (!body) {
        console.error('Box Error:', JSON.stringify({ statusCode: res.statusCode }, null, 2));
        return callback(new UnauthorizedError('Box Error: ' + res.statusCode));
      }

      if (res.statusCode !== 200) {
        console.error('Box Error:', JSON.stringify(body, null, 2));
        return callback(new UnauthorizedError('Box Error: ' + (body.message || body.error_description || body.error)));
      }

      console.log('Box App User created:', res.body.id);
      return auth0.users.updateAppMetadata(user.user_id, { box_appuser_id: res.body.id }, function(err, updatedUser) {
        callback(null, updatedUser, context);
      });
    });
  } else {
    return callback(null, user, context);
  }
}`;
