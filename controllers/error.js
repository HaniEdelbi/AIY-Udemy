exports.getPNF = (req, res) => {
  res.status(404).render("PNF", {
    pageTitle: "Page Not Found",
    path: "/PNF",
    isAuthenticated: req.isLoggedIn,
  });
};
