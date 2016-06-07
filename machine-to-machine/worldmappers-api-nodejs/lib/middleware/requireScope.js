module.exports = function(expected_scope){
  return function (req, res, next){
    if (!req.user || !req.user.scope || req.user.scope.split(' ').indexOf(expected_scope) < 0) {
      return next(new Error('Cannot perform action. Missing scope ' + expected_scope));
    }
    next();
  };
};
