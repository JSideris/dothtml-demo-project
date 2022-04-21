import dot, { IDotCss, IDotElement } from "dothtml";

interface HotelDatum{
    id:string;
    hotel_name:string;
    num_reviews:string;
    address:string;
    num_stars:string;
    amenities:Array<string>;
    image_url:string;
    price:string;
}

const ANY_AMENITY = "ANY";

export default class HotelTable extends dot.Component{

	props={
		currentAmenity: ANY_AMENITY
	}

	builder(): IDotElement {
		return dot.div(
			dot.div().ref("filtersList")
			.table(
				dot.tBody(

				).ref("body")
			)
		);
	}

	async ready(){
		let result = await fetch("https://experimentation-staging.snaptravel.com/interview/hotels", {
			method: 'POST', // *GET, POST, PUT, DELETE, etc.
			mode: 'cors', // no-cors, *cors, same-origin
			cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
			credentials: 'same-origin', // include, *same-origin, omit
			headers: {
			  'Content-Type': 'application/json'
			  // 'Content-Type': 'application/x-www-form-urlencoded',
			},
			redirect: 'follow', // manual, *follow, error
			referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
			body: JSON.stringify(this.generatePayload()) // body data type must match "Content-Type" header
		  });
		let jsonData = await result.json();
		
		let uniqueAmenities: Array<string> = [];
		for(let h of (jsonData.hotels as Array<HotelDatum>) ){
			for(let a of h.amenities){
				if(uniqueAmenities.indexOf(a) == -1){
					uniqueAmenities.push(a);
				}
			}
		}

		// Hotel list:
		dot(this.$refs.body).each(jsonData.hotels, (d:HotelDatum, i)=>{
			
			
			return dot.tr(
				dot
				.td(d.hotel_name)
				.td(d.address.split(",")[1])
				.td(d.num_reviews)
				.td(d.num_stars)
				.td(d.price)
				.td(
					dot.ul(
						dot.each(d.amenities, (a: string)=>dot.li(a))
					)
				)
				.td(
					dot.button("Book").onClick(c=>{
						alert(`Booked ${d.hotel_name}!`);
					})
				)
			).class({
				visible: ()=>{
					return this.getVisibility(d.amenities);
				},
				notVisible: ()=>{
					return !this.getVisibility(d.amenities);
				}
			})
		});

		// Amenity filters:
		dot(this.$refs.filtersList).each(uniqueAmenities, a => {
			return dot.button(a).onClick(()=>{
				this.props.currentAmenity = a;
			});
		});

		this.$updateStyles();
	}

	style(css: IDotCss){
		css(".visible").display("table-row")
		css(".notVisible").display("none")
	}

	generatePayload(){
		return {
			city: "Toronto",
			checkin: "2023-01-01",
			checkout: "2023-01-02",
			provider: 'snaptravel'
		  }
	}

	getVisibility(amenitiesList: Array<string>){	
		return this.props.currentAmenity == ANY_AMENITY || (amenitiesList.indexOf(this.props.currentAmenity) != -1);
	}
}