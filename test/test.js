/**
 * Created by dmeredith1 on 1/5/2017.
 */

describe('Add', function () {
    it('should add two numbers together',function () {
        //1 + 2 should = 3
        expect(add(1,2)).toBe(3);

        expect(add(3,6)).toBe(9);
    })
})