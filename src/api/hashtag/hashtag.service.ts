import HashtagTransport from "./hashtag.transport";
import pool from '../../database/connection';

class HashtagService {

    public async findTrendyHashtags(size: number): Promise<HashtagTransport[]> {
        const hashtagsResult = await pool.query('SELECT COUNT(*), hashtag FROM hashtag h GROUP BY h.hashtag ORDER BY COUNT(*) DESC LIMIT $1', [size]);

        return hashtagsResult.rows.map((hashtagRow: any) => this.mapHashtagRowToHashtagTransport(hashtagRow));
    }

    private mapHashtagRowToHashtagTransport(hashtagRow: any): HashtagTransport {
        return {
            hashtag: hashtagRow['hashtag'],
        };
    }
}

export default HashtagService;