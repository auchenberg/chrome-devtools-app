function TargetsCollection() {
    this.collection = new Map();
}

TargetsCollection.prototype.add = function(id, metadata) {

    var target = metadata;
    target.id = id;

    return this.collection.set(id, target);
}

TargetsCollection.prototype.remove = function(key) {
    return this.collection.delete(key);
}

TargetsCollection.prototype.has = function(key) {
    return this.collection.has(key);
}

TargetsCollection.prototype.clear = function(){
    return this.collection.clear();
}

TargetsCollection.prototype.toArray = function() {

    var targets = [];

    for (var target of this.collection.values()) {
        targets.push(target);
    }

    return targets;

}

module.exports = TargetsCollection;
