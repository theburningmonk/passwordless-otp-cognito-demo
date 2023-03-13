const _ = require('lodash')
const { MAX_ATTEMPTS } = require('../lib/constants')

module.exports.handler = async (event) => {
  const attempts = _.size(event.request.session)
  const lastAttempt = _.last(event.request.session)

  if (event.request.session &&
      event.request.session.find(attempt => attempt.challengeName !== 'CUSTOM_CHALLENGE')) {
      // Should never happen, but in case we get anything other
      // than a custom challenge, then something's wrong and we
      // should abort
      event.response.issueTokens = false
      event.response.failAuthentication = true
  } else if (attempts >= MAX_ATTEMPTS && lastAttempt.challengeResult === false) {
      // The user given too many wrong answers in a row
      event.response.issueTokens = false
      event.response.failAuthentication = true
  } else if (attempts >= 1 &&
      lastAttempt.challengeName === 'CUSTOM_CHALLENGE' &&
      lastAttempt.challengeResult === true) {
      // Right answer
      event.response.issueTokens = true
      event.response.failAuthentication = false
  } else {
      // Wrong answer, try again
      event.response.issueTokens = false
      event.response.failAuthentication = false
      event.response.challengeName = 'CUSTOM_CHALLENGE'
  }

  return event
}
