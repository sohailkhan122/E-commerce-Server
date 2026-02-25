exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // admin hai, proceed
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};
