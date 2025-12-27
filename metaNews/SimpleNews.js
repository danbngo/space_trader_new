//used to add lines to the news summary without creating a full news event
class SimpleNews {
    constructor(description = '', startYear = gs.year, planet = null) {
        this.startDescription = description;
        this.startYear = startYear;
        this.planet = planet;
        this.endYear = null;
        this.started = true;
        this.ended = false;
    }

    static add(description = '', startYear = gs.year, planet = null) {
        const news = new SimpleNews(description, startYear, planet);
        gs.system.simpleNews.push(news);
        return news;
    }
}