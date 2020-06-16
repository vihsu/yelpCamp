var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment   = require("../models/comment");
var middleware = require("../middleware")

//Index route- show all campgrounds
router.get("/", function(req, res){
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render("campgrounds/index",{campgrounds:allCampgrounds});
		}
	});
});

//Create route- add new campgrounds to database
router.post("/", middleware.isLoggedIn, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price;
	var desc = req.body.description;
	var author={
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name:name, image:image, price: price, description:desc, author:author};
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}else{
			res.redirect("/campgrounds");
		}
	});
});

//New- show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

//SHOW- show more info about one campground
router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT Campground Route
router.get("/:id/edit", middleware.checkCampOwner, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		res.render("campgrounds/edit", {campground:foundCampground});
		
	});
});

//UPDATE Campground Route
router.put("/:id", middleware.checkCampOwner, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		} else{
			res.redirect("/campgrounds/" + req.params.id);
		}	 
	});
});

//Destroy Campground Route
router.delete("/:id", middleware.checkCampOwner, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err, campgroundRemoved){
		if(err){
			res.redirect("/campgrounds");
		} 
		Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
            if (err) {
                console.log(err);
            }
			req.flash("success","Campground deleted");
            res.redirect("/campgrounds");
		});
	});
});

module.exports = router;
