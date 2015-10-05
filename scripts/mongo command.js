 //导出\导入 mongo collection
/* mongoexport -d CarrotDB -c Twitterpost_11082014 -o Twitterpost_11082014.json
 mongoimport -d CarrotDB -c Twitterpost_11082014 E:\MongoDB\Twitterpost_11082014.json*/

 //更新 属性名
  db.Collection_Level_3.update({}, {$rename:{"count":"count_3d"}}, false, true);
 //添加新属性
  db.Collection_Level_3.update({},{$set : {count_3d:NumberLong("0")}}) ;
  //删除某属性列
  db.Collection_Level_3.update({},{$unset: {count_3d:0}},false,true);

 // 由 Twitterpost_11072014 导出简约版 TwitterPost_simple_11072014
db.Twitterpost_11072014.find().forEach(function(doc){
    if( doc.coordinates){
    var sim_post={id:doc.id,coordinates:doc.coordinates,created_at:new Date(doc.created_at),cl_1:ObjectId("545c6a56cc85730ed0d25e06"),cl_2:ObjectId("545c6a56cc85730ed0d25e06"),cl_3:ObjectId("545c6a56cc85730ed0d25e06")}
   db.TwitterPost_simple_11072014.insert(sim_post);
   }
});
//通过 TwitterPost_11082014 created_at 更新  TwitterPost_11082014 created_at   属性
db.Twitterpost_11082014.find().forEach(function(doc){
   db.TwitterPost_simple_11082014.update({id:doc.id},{$set:{created_at:new Date(doc.created_at)}});
});

// 由feedplace 导出   Collection_Level_
db.feedplaces1.find().forEach(function(doc){
    var str = doc.polygon.substring(10,doc.polygon.length-2);
    var strarray=str.split(', ');
    var coordinates=[];
    for(var i =0; i<strarray.length;i++){
       var latlng= strarray[i].split(' ');
       var coordinate=  [parseFloat(latlng[0]),parseFloat(latlng[1])];
        coordinates.push( coordinate);
    }
    var place={id:doc.idnumber,parent:0,name:doc.placename,coordinates:{type:"Point",coordinates:[parseFloat(doc.latitude), parseFloat(doc.longitude)]},bounding_box:{type: "Polygon",coordinates:[coordinates]},parent_id:ObjectId("545c6a56cc85730ed0d25e06"),count:0 }
   db.Collection_Level_3.insert(place);
});

//通过 原parent id列更新parent_id
db.Collection_Level_2.find().forEach(function(doc){
         var level2doc=db.Collection_Level_3.findOne({id:doc.parent}) ;
             if (level2doc){
             db.Collection_Level_2.update({_id:doc._id},{$set:{parent_id:level2doc._id}});
             }else{
              db.Collection_Level_2.update({_id:doc._id},{$set:{parent_id:null}});
             }
         });

//通过 TwitterPost_simple_11082014 更新  Collection_Level_1 count 属性
db.Collection_Level_1.find().forEach(function(doc){
   var countnu= db.TwitterPost_simple_11082014.find( { coordinates :
                                     { $geoWithin :{ $geometry : doc.bounding_box}}
                                }
                               ).count();
   db.Collection_Level_1.update({_id:doc._id},{$set:{count:countnu}});
});

//通过 Collection_Level_1 更新  Collection_Level_2 count 属性
db.Collection_Level_2.find().forEach(function(doc){
     var countnu=0;
    db.Collection_Level_1.find( { parent_id :doc._id}).forEach(function(doc2){
                                countnu+=doc2.count;
                             });
   db.Collection_Level_2.update({_id:doc._id},{$set:{count:countnu}});
});

//通过 TwitterPost_simple_11082014 更新  Collection_Level_1 count_1d 属性
db.Collection_Level_1.find().forEach(function(doc){
   var countnu= db.TwitterPost_simple_11082014.find( {
                                coordinates : { $geoWithin :{ $geometry : doc.bounding_box}}
                                }).count();
   db.Collection_Level_1.update({_id:doc._id},{$set:{count_1d:countnu}});
});

//feedplace 导出   Collection_Level_
db.Collection_Level_1.find().forEach(function(doc){
     var count1h= db.socialpost.find({idfeedplaces3:doc.id,
                                      creadate : { $gte : new Date(new Date().getTime()-1*3600*1000)}
                                    }).count();
     var count1d= db.socialpost.find({idfeedplaces3:doc.id,
                                      creadate : { $gte : new Date(new Date().getTime()-24*3600*1000)}
                                     }).count();
     var count3d= db.socialpost.find({idfeedplaces3:doc.id,
                                      creadate : { $gte :new Date(new Date().getTime()-60*24*3600*1000)}
                                     }).count();
    db.Collection_Level_1.update({_id:doc._id},{$set:{count_1h:count1h,count_1d:count1d,count_3d:count3d}});
});

db.Collection_Level_3.find().forEach(function(doc){
     var count1h= db.socialpost.find({idfeedplaces3:doc.id,
                                      creadate : { $gte : ISODate("2014-10-20T14:08:38Z")}
                                    }).count();
     var count1d= db.socialpost.find({idfeedplaces3:doc.id,
                                      creadate : { $gte : ISODate("2014-10-15T14:08:38Z")}
                                     }).count();
     var count3d= db.socialpost.find({idfeedplaces3:doc.id,
                                      creadate : { $gte : ISODate("2014-10-01T14:08:38Z")}
                                     }).count();
    db.Collection_Level_3.update({_id:doc._id},{$set:{count_1h:count1h,count_1d:count1d,count_3d:count3d}});
});

// 修改数据类型
db.socialpost.find().forEach(function(doc){
    var lat= parseFloat(doc.latitude);
    var lng= parseFloat(doc.longitude);
    db.socialpost.update({_id:doc._id},{$set:{latitude:lat,longitude:lng}});
});

/*// 用group 方法 分类汇总
SELECT ord_dt, item_sku, SUM(item_qty) as total
FROM orders
GROUP BY ord_dt, item_sku*/

db.socialpost.group({
 keyf : function(doc) {
     return {"latitude":Math.floor(doc.latitude),"longitude": Math.floor(doc.longitude)};
},
 initial : {count:0},
 reduce : function Reduce(doc, out) {
	out.count+=1;
}
});

//用aggregate方法分类汇总
 db.socialpost.aggregate( {
        $group : {
            _id: { lat: { $subtract:[ "$latitude",{ $mod: ["$latitude",1]}]}, lng: { $subtract:[ "$longitude",{ $mod: ["$longitude",1]}]}},
             cnt : { $sum : 1 }
                }
   });
                  (29.935895213372444, -95.625)(29.611670115197377, -95.152587890625)
 db.socialpost.find({ latitude : { $gte :29.611670115197377 ,$lte:29.935895213372444},longitude :{ $gte :-95.625 ,$lte:-95.152587890625}}).limit(100).sort({ "post_like" : 1 });
 db.socialpost.find( { $query: { latitude : { $gte :29.611670115197377 ,$lte:29.935895213372444},longitude :{ $gte :-95.625 ,$lte:-95.152587890625}}, $orderby: { post_like : 1 } } ).limit(100)